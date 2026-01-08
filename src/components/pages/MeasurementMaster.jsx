import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
    Trash2, Edit3, Plus, X,
    AlertTriangle, CheckCircle, Loader2, Upload, ImageIcon, Ruler, Eye
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import {
    useMeasurements,
    useCreateMeasurement,
    useUpdateMeasurement,
    useDeleteMeasurement
} from "../../hooks/useMeasurements";
import { useSizes } from "../../hooks/useSizes";

export default function MeasurementMaster() {
    // --- Pagination & Search State ---
    const [queryParams, setQueryParams] = useState({
        page: 1,
        search: ""
    });

    const [searchTerm, setSearchTerm] = useState("");

    // --- Form State ---
    const [measurementName, setMeasurementName] = useState("");
    const [measurementType, setMeasurementType] = useState("1"); // 1: Men, 2: Women, 3: Kids, 4: Unisex
    const [sizeValues, setSizeValues] = useState({}); // { name: value }
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);

    // --- Errors & Modals ---
    const [errors, setErrors] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [measurementToDelete, setMeasurementToDelete] = useState(null);
    const [measurementToView, setMeasurementToView] = useState(null);

    // --- React Query Hooks ---
    const { data: measurementData, isLoading: tableLoading } = useMeasurements(queryParams);
    const { data: sizeData } = useSizes({ per_page: 100 }); // Fetch all sizes for the inputs
    const createMutation = useCreateMeasurement();
    const updateMutation = useUpdateMeasurement();
    const deleteMutation = useDeleteMeasurement();

    const measurements = Array.isArray(measurementData?.data) ? measurementData.data : (measurementData?.data?.data || []);
    const activeSizes = Array.isArray(sizeData?.data) ? sizeData.data : (sizeData?.data?.data || []);
    const pagination = measurementData?.data?.current_page ? {
        current_page: measurementData?.data?.current_page || 1,
        last_page: measurementData?.data?.last_page || 1,
        total: measurementData?.data?.total || 0,
        per_page: measurementData?.data?.per_page || 10,
        from: measurementData?.data?.from || 0,
        to: measurementData?.data?.to || 0
    } : {
        current_page: 1,
        last_page: 1,
        total: measurements.length,
        per_page: measurements.length || 10,
        from: 1,
        to: measurements.length
    };

    // --- Form Handlers ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setMeasurementName("");
        setMeasurementType("1");
        setSizeValues({});
        setSelectedImage(null);
        setImagePreview(null);
        setEditingId(null);
        setErrors({});
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSizeValueChange = (sizeName, value) => {
        setSizeValues(prev => ({
            ...prev,
            [sizeName]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        // Validate that all active sizes have a value (as per backend rule)
        const providedSizes = Object.keys(sizeValues).filter(k => sizeValues[k]?.toString()?.trim());
        const activeSizeNames = activeSizes.map(s => s.name);
        const missingSizes = activeSizeNames.filter(name => !providedSizes.includes(name));

        if (missingSizes.length > 0) {
            toast.error(`Please provide values for: ${missingSizes.join(", ")}`);
            return;
        }

        const formData = new FormData();
        formData.append("name", measurementName);
        formData.append("type", measurementType);
        formData.append("size_values", JSON.stringify(sizeValues));
        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        if (editingId) {
            updateMutation.mutate({ id: editingId, formData }, {
                onSuccess: (data) => {
                    if (data.status) resetForm();
                    else if (data.errors) setErrors(data.errors);
                },
                onError: (err) => {
                    if (err.response?.status === 422) setErrors(err.response.data.errors);
                }
            });
        } else {
            if (!selectedImage) {
                toast.error("Please upload an image for the measurement part");
                return;
            }
            createMutation.mutate(formData, {
                onSuccess: (data) => {
                    if (data.status) resetForm();
                    else if (data.errors) setErrors(data.errors);
                },
                onError: (err) => {
                    if (err.response?.status === 422) setErrors(err.response.data.errors);
                }
            });
        }
    };

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setMeasurementName(item.name || "");
        setMeasurementType(item.type?.toString() || "1");
        setImagePreview(item.image);

        // Handle size_values which might be a JSON string from API or empty array
        let rawSizes = item.size_values || item.size_details || {};
        if (typeof rawSizes === "string") {
            try {
                rawSizes = JSON.parse(rawSizes);
            } catch (e) {
                rawSizes = {};
            }
        }
        // If it comes as an empty array from API, convert to object
        if (Array.isArray(rawSizes)) rawSizes = {};

        setSizeValues(rawSizes);
        setSelectedImage(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleViewClick = (item) => {
        let rawSizes = item.size_values || item.size_details || {};
        if (typeof rawSizes === "string") {
            try {
                rawSizes = JSON.parse(rawSizes);
            } catch (e) {
                rawSizes = {};
            }
        }
        if (Array.isArray(rawSizes)) rawSizes = {};

        setMeasurementToView({ ...item, parsed_sizes: rawSizes });
        setViewModalOpen(true);
    };

    // --- Delete Handlers ---
    const initiateDelete = (id) => {
        setMeasurementToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!measurementToDelete) return;
        deleteMutation.mutate(measurementToDelete, {
            onSettled: () => {
                setDeleteModalOpen(false);
                setMeasurementToDelete(null);
            }
        });
    };

    const isFormLoading = createMutation.isPending || updateMutation.isPending;

    // --- Table Columns Configuration ---
    const columns = [
        {
            header: "#",
            className: "w-16",
            render: (row, index) => (
                <span className="text-slate-400 text-xs">
                    {(pagination.from || 1) + index}
                </span>
            )
        },
        {
            header: "Preview",
            className: "w-20",
            render: (row) => (
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                    {row.image ? (
                        <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={20} className="text-slate-400" />
                    )}
                </div>
            )
        },
        {
            header: "Measurement Part",
            render: (row) => (
                <div>
                    <span className="font-medium text-slate-800">{row.name || "N/A"}</span>
                </div>
            )
        },
        {
            header: "Type",
            render: (row) => {
                const typeMap = {
                    1: { label: "Men", class: "bg-blue-100 text-blue-700" },
                    2: { label: "Women", class: "bg-pink-100 text-pink-700" },
                    3: { label: "Kids", class: "bg-orange-100 text-orange-700" },
                    4: { label: "Unisex", class: "bg-purple-100 text-purple-700" }
                };
                const config = typeMap[row.type] || { label: row.type_name || "N/A", class: "bg-slate-100 text-slate-700" };
                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${config.class}`}>
                        {row.type_name || config.label}
                    </span>
                );
            }
        },
        {
            header: "Actions",
            className: "text-right",
            tdClassName: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => handleViewClick(row)}
                        className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Edit Item"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={() => initiateDelete(row.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Delete Item"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Measurement Master</h1>
                <p className="text-sm text-slate-500 mt-1">Manage body measurements parts and visual guides</p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT COLUMN: Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="xl:col-span-1 h-fit"
                >
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm sticky top-6">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-lg flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                {editingId ? <Edit3 size={18} className="text-blue-600" /> : <Plus size={18} className="text-blue-600" />}
                                {editingId ? "Edit Part" : "New Part"}
                            </h2>
                            {editingId && (
                                <button onClick={resetForm} className="text-xs text-red-600 hover:underline font-medium">
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Type Selection */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Type <span className="text-red-500">*</span></label>
                                <select
                                    value={measurementType}
                                    onChange={(e) => setMeasurementType(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="1">Men</option>
                                    <option value="2">Women</option>
                                    <option value="4">Unisex</option>
                                    <option value="3">Kids</option>
                                </select>
                            </div>

                            {/* Name Input */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Part Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={measurementName}
                                    onChange={(e) => setMeasurementName(e.target.value)}
                                    placeholder="e.g. Bust, Chest, Waist"
                                    className={`w-full px-3 py-2 bg-white border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                            </div>

                            {/* Size Values Section */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <Ruler size={14} /> Size Values (Standard)
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {activeSizes.map((size) => (
                                        <div key={size.id} className="space-y-1">
                                            <label className="text-[11px] font-semibold text-slate-600 block uppercase">{size.name}</label>
                                            <input
                                                type="text"
                                                required
                                                value={sizeValues[size.name] || ""}
                                                onChange={(e) => handleSizeValueChange(size.name, e.target.value)}
                                                placeholder="Value"
                                                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    ))}
                                    {activeSizes.length === 0 && (
                                        <p className="col-span-2 text-[10px] text-slate-400 italic">No active sizes found. Please add sizes first.</p>
                                    )}
                                </div>
                                {errors.size_values && <p className="text-red-500 text-[10px] mt-1">{errors.size_values}</p>}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Guide Image {!editingId && <span className="text-red-500">*</span>}</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative h-40 w-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${imagePreview ? 'border-blue-400 bg-blue-50/10' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
                                        }`}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-xs font-semibold flex items-center gap-1">
                                                    <Upload size={14} /> Change Image
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200 mb-2">
                                                <Upload size={20} className="text-slate-500" />
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium text-center px-4">
                                                Click to upload guide image<br />
                                                <span className="text-[10px] text-slate-400">(JPG, PNG support)</span>
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image[0]}</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isFormLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isFormLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <CheckCircle size={18} /> : <Plus size={18} />)}
                                    {isFormLoading ? "Processing..." : (editingId ? "Update Part" : "Create Part")}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN: Reusable Data Table */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="xl:col-span-2"
                >
                    <DataTable
                        columns={columns}
                        data={measurements}
                        loading={tableLoading}
                        pagination={pagination}
                        searchTerm={searchTerm}
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setQueryParams(prev => ({ ...prev, page: 1, search: term }));
                        }}
                        onPageChange={(newPage) => setQueryParams(prev => ({ ...prev, page: newPage }))}
                        searchPlaceholder="Search parts..."
                    />
                </motion.div>
            </div>

            {/* --- VIEW DETAILS MODAL --- */}
            <AnimatePresence>
                {viewModalOpen && measurementToView && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                        >
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Eye size={18} className="text-blue-600" />
                                    Measurement Details
                                </h3>
                                <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-0 overflow-hidden">
                                {measurementToView.image ? (
                                    <div className="w-full bg-slate-100 border-b border-slate-100 flex items-center justify-center p-4">
                                        <img src={measurementToView.image} className="max-h-72 w-auto object-contain rounded-lg shadow-sm" alt="" />
                                    </div>
                                ) : (
                                    <div className="w-full h-48 bg-slate-100 border-b border-slate-100 flex items-center justify-center text-slate-400 p-4">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-900">{measurementToView.name}</h4>
                                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${measurementToView.type === 2 ? "bg-pink-100 text-pink-700" :
                                        measurementToView.type === 1 ? "bg-blue-100 text-blue-700" :
                                            measurementToView.type === 3 ? "bg-orange-100 text-orange-700" :
                                                "bg-purple-100 text-purple-700"
                                        }`}>
                                        {measurementToView.type_name || "N/A"}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Size Measurements</h5>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {Object.entries(measurementToView.parsed_sizes || {}).map(([size, value]) => (
                                            <div key={size} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{size}</p>
                                                <p className="text-lg font-bold text-slate-800">{value}</p>
                                            </div>
                                        ))}
                                        {Object.keys(measurementToView.parsed_sizes || {}).length === 0 && (
                                            <p className="col-span-3 text-sm text-slate-400 italic text-center py-4">No size values recorded.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={() => setViewModalOpen(false)}
                                    className="px-6 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
                        >

                            {/* Modal Header */}
                            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <div className="p-1.5 bg-red-100 rounded-full text-red-600">
                                        <AlertTriangle size={18} />
                                    </div>
                                    Confirm Deletion
                                </h3>
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-6">
                                <p className="text-slate-600 leading-relaxed">
                                    Are you sure you want to permanently delete this measurement part? <br />
                                    <span className="text-xs text-slate-400">This action cannot be undone.</span>
                                </p>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-md shadow-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                >
                                    Yes, Delete It
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
