import { useState, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
    Trash2, Edit3, Plus, X,
    AlertTriangle, CheckCircle, Loader2, Search, Zap, Layers, Ruler, ImageIcon
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import { useCategories } from "../../hooks/useCategories";
import { useSubCategories } from "../../hooks/useSubCategories";
import { useMeasurements } from "../../hooks/useMeasurements";
import {
    useMeasurementMappings,
    useCreateMeasurementMapping,
    useUpdateMeasurementMapping,
    useDeleteMeasurementMapping
} from "../../hooks/useMeasurementMapping";


const GENDER_TYPES = [
    { value: "1", label: "Men" },
    { value: "2", label: "Women" },
    { value: "3", label: "Kids" },
    { value: "4", label: "Unisex" },
    { value: "5", label: "Others" },
];

export default function MeasurementMapping() {
    // --- Data State ---
    const [queryParams, setQueryParams] = useState({ page: 1, search: "" });
    const [searchTerm, setSearchTerm] = useState("");

    // --- Form State ---
    const [mappingName, setMappingName] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategories, setSelectedSubcategories] = useState([]); // Array of IDs
    const [selectedGender, setSelectedGender] = useState("");
    const [selectedMeasurements, setSelectedMeasurements] = useState([]); // Array of IDs
    const [editingId, setEditingId] = useState(null);

    // --- Fetching Data ---
    const { data: mappingData, isLoading: tableLoading } = useMeasurementMappings(queryParams);
    const { data: categoryData } = useCategories({ per_page: 1000 });
    const { data: subcategoryData } = useSubCategories({ per_page: 1000 });
    const { data: measurementData } = useMeasurements({ per_page: 1000 });

    const createMutation = useCreateMeasurementMapping();
    const updateMutation = useUpdateMeasurementMapping();
    const deleteMutation = useDeleteMeasurementMapping();

    // --- Derived Data ---
    const mappings = Array.isArray(mappingData?.data) ? mappingData.data : (mappingData?.data?.data || []);
    const categories = Array.isArray(categoryData?.data) ? categoryData.data : (categoryData?.data?.data || []);
    const allSubcategories = Array.isArray(subcategoryData?.data) ? subcategoryData.data : (subcategoryData?.data?.data || []);
    const allMeasurements = Array.isArray(measurementData?.data) ? measurementData.data : (measurementData?.data?.data || []);

    const pagination = {
        current_page: mappingData?.pagination?.current_page || mappingData?.data?.current_page || 1,
        last_page: mappingData?.pagination?.last_page || mappingData?.data?.last_page || 1,
        total: mappingData?.pagination?.total || mappingData?.data?.total || 0,
        per_page: mappingData?.pagination?.per_page || mappingData?.data?.per_page || 10,
        from: mappingData?.pagination?.from || mappingData?.data?.from || 0,
        to: mappingData?.pagination?.to || mappingData?.data?.to || 0
    };

    // Filter labels
    const getGenderLabel = (val) => GENDER_TYPES.find(g => g.value === String(val))?.label || "Unknown";

    // Multi-select Lists Filtering
    const filteredCategories = useMemo(() => {
        if (!selectedGender) return [];
        return categories.filter(cat => String(cat.type) === String(selectedGender));
    }, [categories, selectedGender]);

    const filteredSubcategories = useMemo(() => {
        if (!selectedCategory) return [];
        return allSubcategories.filter(sub => String(sub.category_id) === String(selectedCategory));
    }, [allSubcategories, selectedCategory]);

    const filteredMeasurements = useMemo(() => {
        if (!selectedGender) return [];
        // Assuming measurement_type or similar field maps to gender
        return allMeasurements.filter(m => String(m.type) === String(selectedGender));
    }, [allMeasurements, selectedGender]);

    // --- Handlers ---
    const toggleSubcategory = (id) => {
        setSelectedSubcategories(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleMeasurement = (id) => {
        setSelectedMeasurements(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const resetForm = () => {
        setMappingName("");
        setSelectedCategory("");
        setSelectedSubcategories([]);
        setSelectedGender("");
        setSelectedMeasurements([]);
        setEditingId(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedSubcategories.length === 0 || selectedMeasurements.length === 0) {
            toast.warning("Please select at least one subcategory and one measurement");
            return;
        }

        const payload = {
            name: mappingName,
            category_id: selectedCategory,
            subcategory_ids: selectedSubcategories,
            gender: selectedGender,
            measurement_ids: selectedMeasurements
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, payload }, {
                onSuccess: (data) => data.status && resetForm()
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: (data) => data.status && resetForm()
            });
        }
    };

    const handleEdit = (row) => {
        setEditingId(row.id);
        setMappingName(row.name);
        setSelectedCategory(row.category_id);
        setSelectedSubcategories(row.subcategories?.map(s => s.id) || []);
        setSelectedGender(row.gender);
        setSelectedMeasurements(row.measurements?.map(m => m.id) || []);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- Table Columns ---
    const columns = [
        {
            header: "#",
            className: "w-16",
            render: (_, index) => <span className="text-slate-400 text-xs">{(pagination.from || 1) + index}</span>
        },
        {
            header: "Mapping Name",
            render: (row) => <span className="font-semibold text-slate-800">{row.name}</span>
        },
        {
            header: "Category",
            render: (row) => (
                <span className="text-slate-600">{row.category?.name || "N/A"}</span>
            )
        },
        {
            header: "Gender",
            render: (row) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                    {getGenderLabel(row.gender)}
                </span>
            )
        },
        {
            header: "Counts",
            render: (row) => (
                <div className="flex gap-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                        {row.subcategories?.length || 0} Subs
                    </span>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">
                        {row.measurements?.length || 0} Mechs
                    </span>
                </div>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(row)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Delete this mapping?")) deleteMutation.mutate(row.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const isFormLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Measurement Mapping</h1>
                <p className="text-sm text-slate-500 mt-1">Bind categories, subcategories and measurements together</p>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Form Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="xl:col-span-4"
                >
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                                {editingId ? <Edit3 size={18} className="text-blue-600" /> : <Plus size={18} className="text-blue-600" />}
                                {editingId ? "Edit Mapping" : "New Mapping"}
                            </h2>
                            {editingId && (
                                <button onClick={resetForm} className="text-xs text-red-600 hover:underline font-medium">Cancel</button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Mapping Name */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Mapping Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={mappingName}
                                    onChange={(e) => setMappingName(e.target.value)}
                                    placeholder="e.g. Mens Casual Top Wear"
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            {/* Gender Selection */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[10px]">Step 1: Gender</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {GENDER_TYPES.map(g => (
                                        <button
                                            key={g.value}
                                            type="button"
                                            onClick={() => {
                                                setSelectedGender(g.value);
                                                setSelectedCategory("");
                                                setSelectedSubcategories([]);
                                                setSelectedMeasurements([]);
                                            }}
                                            className={`px-2 py-2 rounded-lg text-[11px] font-bold border transition-all ${selectedGender === g.value
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                                                }`}
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Category */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[10px]">Step 2: Main Category</label>
                                <select
                                    required
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        setSelectedSubcategories([]);
                                    }}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">
                                        {!selectedGender ? "Select Gender First" : filteredCategories.length === 0 ? "No Categories Found" : "Select Category..."}
                                    </option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Multi-select Subcategories */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[10px]">Step 3: Subcategories</label>
                                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                                    {!selectedCategory ? (
                                        <p className="text-xs text-slate-400 text-center py-6">Select a category first</p>
                                    ) : filteredSubcategories.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-6">No subcategories found</p>
                                    ) : (
                                        <div className="max-h-56 overflow-y-auto p-2 grid grid-cols-1 gap-2">
                                            {filteredSubcategories.map(sub => (
                                                <label key={sub.id} className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${selectedSubcategories.includes(sub.id) ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-200'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSubcategories.includes(sub.id)}
                                                        onChange={() => toggleSubcategory(sub.id)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                    />
                                                    <span className={`text-xs font-semibold ${selectedSubcategories.includes(sub.id) ? 'text-blue-700' : 'text-slate-700'}`}>{sub.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedSubcategories.length > 0 && (
                                    <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                                        <CheckCircle size={10} /> {selectedSubcategories.length} subcategories selected
                                    </p>
                                )}
                            </div>

                            {/* Multi-select Measurements */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700 uppercase tracking-wider text-[10px]">Step 4: Measurements</label>
                                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                                    {!selectedGender ? (
                                        <p className="text-xs text-slate-400 text-center py-6">Select a gender first</p>
                                    ) : filteredMeasurements.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-6">No measurements found</p>
                                    ) : (
                                        <div className="max-h-64 overflow-y-auto p-2 grid grid-cols-1 gap-2">
                                            {filteredMeasurements.map(m => (
                                                <label key={m.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${selectedMeasurements.includes(m.id) ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-200'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedMeasurements.includes(m.id)}
                                                        onChange={() => toggleMeasurement(m.id)}
                                                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                                    />
                                                    <div className="w-12 h-12 rounded bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                                                        {m.image ? (
                                                            <img src={`${m.image}`} alt={m.name || m.part_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                <Ruler size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs font-bold ${selectedMeasurements.includes(m.id) ? 'text-purple-700' : 'text-slate-800'}`}>{m.name || m.part_name}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase">{getGenderLabel(m.type)}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedMeasurements.length > 0 && (
                                    <p className="text-[10px] text-purple-600 font-semibold flex items-center gap-1">
                                        <CheckCircle size={10} /> {selectedMeasurements.length} measurements selected
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={isFormLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                                >
                                    {isFormLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <CheckCircle size={18} /> : <Plus size={18} />)}
                                    {isFormLoading ? "Processing..." : (editingId ? "Update Mapping" : "Create Mapping")}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="xl:col-span-8"
                >
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={mappings}
                            loading={tableLoading}
                            pagination={pagination}
                            searchTerm={searchTerm}
                            onSearch={(term) => {
                                setSearchTerm(term);
                                setQueryParams(prev => ({ ...prev, page: 1, search: term }));
                            }}
                            onPageChange={(newPage) => setQueryParams(prev => ({ ...prev, page: newPage }))}
                            searchPlaceholder="Search mappings..."
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
