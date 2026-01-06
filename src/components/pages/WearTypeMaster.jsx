import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
    Trash2, Edit3, Plus, X,
    AlertTriangle, CheckCircle, Loader2
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import {
    useWearTypes,
    useCreateWearType,
    useUpdateWearType,
    useDeleteWearType
} from "../../hooks/useWearTypes";

export default function WearTypeMaster() {
    // --- Pagination & Search State ---
    const [queryParams, setQueryParams] = useState({
        page: 1,
        search: ""
    });

    const [searchTerm, setSearchTerm] = useState("");

    // --- Form State ---
    const [wearTypeName, setWearTypeName] = useState("");
    const [editingId, setEditingId] = useState(null);

    // --- Errors & Modals ---
    const [errors, setErrors] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // --- React Query Hooks ---
    const { data: apiResponse, isLoading: tableLoading } = useWearTypes(queryParams);
    const createMutation = useCreateWearType();
    const updateMutation = useUpdateWearType();
    const deleteMutation = useDeleteWearType();

    // Handle both direct array and paginated response
    const items = Array.isArray(apiResponse?.data) ? apiResponse.data : (apiResponse?.data?.data || []);
    const pagination = apiResponse?.data?.current_page ? {
        current_page: apiResponse?.data?.current_page || 1,
        last_page: apiResponse?.data?.last_page || 1,
        total: apiResponse?.data?.total || 0,
        per_page: apiResponse?.data?.per_page || 10,
        from: apiResponse?.data?.from || 0,
        to: apiResponse?.data?.to || 0
    } : {
        current_page: 1,
        last_page: 1,
        total: items.length,
        per_page: items.length || 10,
        from: 1,
        to: items.length
    };

    // --- Form Handlers ---
    const resetForm = () => {
        setWearTypeName("");
        setEditingId(null);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const payload = { name: wearTypeName };

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

    const handleEditClick = (item) => {
        setEditingId(item.id);
        setWearTypeName(item.name || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --- Delete Handlers ---
    const initiateDelete = (id) => {
        setItemToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        deleteMutation.mutate(itemToDelete, {
            onSettled: () => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
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
            header: "Wear Type Name",
            render: (row) => (
                <span className="font-medium text-slate-800 uppercase">{row.name}</span>
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Wear Type Master</h1>
                <p className="text-sm text-slate-500 mt-1">Manage wear types for your items</p>
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
                                {editingId ? "Edit Wear Type" : "New Wear Type"}
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
                                <label className="block text-sm font-medium text-slate-700">Wear Type Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={wearTypeName}
                                    onChange={(e) => setWearTypeName(e.target.value)}
                                    placeholder="e.g. Formal, Casual, Sportswear"
                                    className={`w-full px-3 py-2 bg-white border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.name ? 'border-red-300' : 'border-slate-300'}`}
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isFormLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isFormLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <CheckCircle size={18} /> : <Plus size={18} />)}
                                    {isFormLoading ? "Processing..." : (editingId ? "Update Wear Type" : "Create Wear Type")}
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
                        data={items}
                        loading={tableLoading}
                        pagination={pagination}
                        searchTerm={searchTerm}
                        onSearch={(term) => {
                            setSearchTerm(term);
                            setQueryParams(prev => ({ ...prev, page: 1, search: term }));
                        }}
                        onPageChange={(newPage) => setQueryParams(prev => ({ ...prev, page: newPage }))}
                        searchPlaceholder="Search wear types..."
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
                                    Are you sure you want to permanently delete this wear type? <br />
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
