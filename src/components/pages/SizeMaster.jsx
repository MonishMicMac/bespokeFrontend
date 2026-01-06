import { useState } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
    Trash2, Edit3, Plus, X,
    AlertTriangle, CheckCircle, Loader2
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import {
    useSizes,
    useCreateSize,
    useUpdateSize,
    useDeleteSize
} from "../../hooks/useSizes";

export default function SizeMaster() {
    // --- Pagination & Search State ---
    const [queryParams, setQueryParams] = useState({
        page: 1,
        search: ""
    });

    const [searchTerm, setSearchTerm] = useState("");

    // --- Form State ---
    const [sizeName, setSizeName] = useState("");
    const [editingId, setEditingId] = useState(null);

    // --- Errors & Modals ---
    const [errors, setErrors] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [sizeToDelete, setSizeToDelete] = useState(null);

    // --- React Query Hooks ---
    const { data: sizeData, isLoading: tableLoading } = useSizes(queryParams);
    const createMutation = useCreateSize();
    const updateMutation = useUpdateSize();
    const deleteMutation = useDeleteSize();

    // Handle both direct array and paginated response
    const sizes = Array.isArray(sizeData?.data) ? sizeData.data : (sizeData?.data?.data || []);
    const pagination = sizeData?.data?.current_page ? {
        current_page: sizeData?.data?.current_page || 1,
        last_page: sizeData?.data?.last_page || 1,
        total: sizeData?.data?.total || 0,
        per_page: sizeData?.data?.per_page || 10,
        from: sizeData?.data?.from || 0,
        to: sizeData?.data?.to || 0
    } : {
        current_page: 1,
        last_page: 1,
        total: sizes.length,
        per_page: sizes.length || 10,
        from: 1,
        to: sizes.length
    };

    // --- Form Handlers ---
    const resetForm = () => {
        setSizeName("");
        setEditingId(null);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const payload = { name: sizeName };

        if (editingId) {
            updateMutation.mutate({ id: editingId, payload }, {
                onSuccess: (data) => {
                    if (data.status) resetForm();
                    else if (data.errors) setErrors(data.errors);
                },
                onError: (err) => {
                    if (err.response?.status === 422) setErrors(err.response.data.errors);
                }
            });
        } else {
            createMutation.mutate(payload, {
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

    const handleEditClick = (sizeItem) => {
        setEditingId(sizeItem.id);
        setSizeName(sizeItem.name || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- Delete Handlers ---
    const initiateDelete = (id) => {
        setSizeToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!sizeToDelete) return;
        deleteMutation.mutate(sizeToDelete, {
            onSettled: () => {
                setDeleteModalOpen(false);
                setSizeToDelete(null);
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
            header: "Size Name",
            render: (row) => (
                <span className="font-medium text-slate-800 uppercase">{row.name || "N/A"}</span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            tdClassName: "text-right",
            render: (row) => (
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => handleEditClick(row)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={() => initiateDelete(row.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Size Master</h1>
                <p className="text-sm text-slate-500 mt-1">Manage global product sizes (S, M, L, XL, etc.)</p>
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
                                {editingId ? "Edit Size" : "New Size"}
                            </h2>
                            {editingId && (
                                <button onClick={resetForm} className="text-xs text-red-600 hover:underline font-medium">
                                    Cancel
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Name Input */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-slate-700">Size Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={sizeName}
                                    onChange={(e) => setSizeName(e.target.value)}
                                    placeholder="e.g. XL, 42, XXL"
                                    className={`w-full px-3 py-2 bg-white border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                                <p className="text-[10px] text-slate-400">Enter simple labels like S, M, L or numeric values.</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isFormLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isFormLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <CheckCircle size={18} /> : <Plus size={18} />)}
                                    {isFormLoading ? "Processing..." : (editingId ? "Update Size" : "Create Size")}
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
                        data={sizes}
                        loading={tableLoading}
                        pagination={pagination}
                        searchTerm={searchTerm}
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setQueryParams(prev => ({ ...prev, page: 1, search: term }));
                        }}
                        onPageChange={(newPage) => setQueryParams(prev => ({ ...prev, page: newPage }))}
                        searchPlaceholder="Search sizes..."
                    />
                </motion.div>
            </div>

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
                                    Are you sure you want to permanently delete this size? <br />
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
