import React, { useReducer, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DataTable from "../../ui/DataTable";
import { toast } from "react-toastify";
import { Filter, RotateCcw, X, Loader2, CheckCircle, AlertCircle, Upload, Edit3, Trash2 } from "lucide-react";
import { useVendorList } from "../../../hooks/useVendors";
import api from "../../../api/axios";
import { motion, AnimatePresence } from "framer-motion";

// --- 1. Reducer for Bulk Actions ---
const initialState = {
    isOpen: false,           // Controls modal visibility
    actionType: null,        // 'APPROVE' (1), 'DECLINE' (2), 'DELETE' (3)
    remarks: "",             // Stores decline reason
    isSubmitting: false,     // Loading spinner state
};

const bulkActionReducer = (state, action) => {
    switch (action.type) {
        case "OPEN_MODAL":
            return {
                ...state,
                isOpen: true,
                actionType: action.payload,
                remarks: "", // Clear remarks when opening
            };
        case "CLOSE_MODAL":
            return {
                ...state,
                isOpen: false,
                actionType: null,
                remarks: "",
                isSubmitting: false
            };
        case "SET_REMARKS":
            return {
                ...state,
                remarks: action.payload
            };
        case "START_SUBMIT":
            return {
                ...state,
                isSubmitting: true
            };
        case "SUBMIT_COMPLETE":
            return {
                ...initialState // Reset to initial state on success
            };
        default:
            return state;
    }
};

const VendorList = () => {
    const navigate = useNavigate();

    // --- State Management ---
    const [searchTerm, setSearchTerm] = useState("");
    const [checkCheckBox, setChecked] = useState([]); // Selected IDs

    // Filters (Local state)
    const [filters, setFilters] = useState({
        from_date: "",
        to_date: "",
        vendor_type: "",
        approval_status: "",
        is_banned: ""
    });

    // Query Params (Triggers API fetch)
    const [queryParams, setQueryParams] = useState({
        page: 1,
        search: "",
        from_date: "",
        to_date: "",
        vendor_type: "",
        approval_status: "",
        is_banned: ""
    });

    // Initialize Reducer
    const [actionState, dispatch] = useReducer(bulkActionReducer, initialState);

    // Fetch Data
    const { data, isLoading, isError, error, refetch } = useVendorList(queryParams);

    // Derived Data
    const vendors = data?.data?.data || [];
    const meta = data?.data || {};
    const pagination = {
        current_page: meta.current_page || 1,
        last_page: meta.last_page || 1,
        total: meta.total || 0,
        from: meta.from || 0,
        to: meta.to || 0,
    };

    // Error Handling
    useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to fetch vendor list");
        }
    }, [isError, error]);

    // --- Handlers ---

    const handlePageChange = (newPage) => {
        setQueryParams(prev => ({ ...prev, page: newPage }));
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setQueryParams(prev => ({ ...prev, page: 1, search: term }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setQueryParams({ ...filters, search: searchTerm, page: 1 });
    };

    const resetFilters = () => {
        const resetValues = { from_date: "", to_date: "", vendor_type: "", approval_status: "", is_banned: "" };
        setFilters(resetValues);
        setSearchTerm("");
        setQueryParams({ ...resetValues, page: 1, search: "" });
    };

    // --- Bulk Action Logic ---

    // 1. Export Handler
    const handleExport = () => {
        if (checkCheckBox.length === 0) return;

        // Filter selected vendors
        const selectedVendors = vendors.filter(v => checkCheckBox.includes(v.id));

        // Define headers and map data
        const csvHeaders = ["ID", "Shop Name", "Type", "Mobile", "Email", "Status", "Is Banned"];
        const csvRows = selectedVendors.map(v => [
            v.id,
            `"${v.shop_name || ''}"`, // Quote strings
            v.vendor_type === 1 ? "Shop" : "Designer",
            v.mobile_no || '',
            v.email || '',
            v.approval_status === "1" ? "Approved" : v.approval_status === "2" ? "Rejected" : "Pending",
            v.is_banned === "1" ? "Yes" : "No"
        ]);

        // Construct CSV content
        const csvContent = [
            csvHeaders.join(","),
            ...csvRows.map(row => row.join(","))
        ].join("\n");

        // Download logic
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `vendors_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 2. Edit Handler (Single selection only)
    const handleEditStart = () => {
        if (checkCheckBox.length !== 1) {
            toast.info("Please select exactly one vendor to edit.");
            return;
        }
        const vendorId = checkCheckBox[0];
        navigate(`/vendor/details/${vendorId}`);
    };

    const initiateAction = (type) => {
        if (checkCheckBox.length === 0) {
            toast.warn("Please select at least one vendor.");
            return;
        }
        dispatch({ type: "OPEN_MODAL", payload: type });
    };

    const handleSubmitAction = async () => {
        if (actionState.actionType === 'DECLINE' && !actionState.remarks.trim()) {
            toast.error("Please provide a reason for declining.");
            return;
        }

        dispatch({ type: "START_SUBMIT" });

        try {
            let response;

            if (actionState.actionType === 'DELETE') {
                // Bulk Delete Endpoint
                response = await api.post(`${import.meta.env.VITE_API_URL}/vendor/bulk-delete`, {
                    vendor_ids: checkCheckBox
                });
            } else {
                // Bulk Approval/Decline Endpoint
                const payload = {
                    vendor_ids: checkCheckBox,
                    approval_status: actionState.actionType === "APPROVE" ? 1 : 2,
                    decline_remarks: actionState.actionType === "DECLINE" ? actionState.remarks : null
                };
                response = await api.post(`${import.meta.env.VITE_API_URL}/vendor/bulk-approval-update`, payload);
            }

            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.message || "Action completed successfully!");
                setChecked([]); // Clear checkboxes
                refetch();      // Refresh table
                dispatch({ type: "SUBMIT_COMPLETE" });
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to complete action.");
            dispatch({ type: "CLOSE_MODAL" }); // Close modal so user can retry
        }
    };

    // --- Columns Definition ---
    const columns = [
        {
            header: "ID",
            accessor: "id",
            className: "w-12 text-center",
            render: (_row, index) => (
                <span className="text-slate-500 text-xs">{(pagination.from || 1) + index}</span>
            )
        },
        {
            header: "Select",
            accessor: "checkbox",
            className: "w-12 text-center",
            render: (row) => (
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        checked={checkCheckBox.includes(row.id)}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setChecked((prev) => [...prev, row.id]);
                            } else {
                                setChecked((prev) => prev.filter(id => id !== row.id));
                            }
                        }}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            )
        },
        {
            header: "Image",
            accessor: "img_path",
            render: (row) => (
                row.img_path ? (
                    <img
                        src={row.img_path}
                        alt={row.shop_name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                        {row.shop_name?.substring(0, 2)?.toUpperCase()}
                    </div>
                )
            )
        },
        {
            header: "Shop Name",
            accessor: "shop_name",
            className: "font-medium text-slate-800",
            render: (row) => (
                <button
                    onClick={() => navigate(`/vendor/details/${row.id}`)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
                >
                    {row.shop_name}
                </button>
            )
        },
        {
            header: "Detail",
            accessor: "vendor_type",
            render: (row) => (
                <div className="flex flex-col text-xs text-slate-500">
                    <span>{row.username}</span>

                </div>
            )
        },
        {
            header: "Contact",
            accessor: "mobile_no",
            render: (row) => (
                <div className="flex flex-col text-xs">
                    <span>{row.mobile_no}</span>
                    <span className="text-slate-400">{row.email}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessor: "approval_status",
            render: (row) => {
                const statusMap = {
                    "0": { label: "Pending", class: "bg-yellow-100 text-yellow-700 border-yellow-200" },
                    "1": { label: "Approved", class: "bg-green-100 text-green-700 border-green-200" },
                    "2": { label: "Rejected", class: "bg-red-100 text-red-700 border-red-200" },
                };
                const status = statusMap[row.approval_status] || { label: "Unknown", class: "bg-gray-100 text-gray-700" };
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.class}`}>
                        {status.label}
                    </span>
                );
            },
        },
        {
            header: "Account",
            accessor: "is_banned",
            render: (row) => (
                row.is_banned === "1" ? (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Banned</span>
                ) : (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Active</span>
                )
            )
        }
    ];

    return (
        <div className="p-6 space-y-6 relative min-h-screen bg-slate-50/50">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Vendor Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all registered vendors and their approval status.</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Date Filters */}
                    <div className="lg:col-span-1">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">From Date</label>
                        <input type="date" name="from_date" value={filters.from_date} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">To Date</label>
                        <input type="date" name="to_date" value={filters.to_date} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" />
                    </div>

                    {/* Dropdowns */}
                    <div className="lg:col-span-1">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Vendor Type</label>
                        <select name="vendor_type" value={filters.vendor_type} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">All Types</option>
                            <option value="1">Shop</option>
                            <option value="2">Designer</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Approval</label>
                        <select name="approval_status" value={filters.approval_status} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">All Status</option>
                            <option value="0">Pending</option>
                            <option value="1">Approved</option>
                            <option value="2">Declined</option>
                        </select>
                    </div>
                    <div className="lg:col-span-1">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Ban Status</label>
                        <select name="is_banned" value={filters.is_banned} onChange={handleFilterChange} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">All</option>
                            <option value="0">Active</option>
                            <option value="1">Banned</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-1 flex items-end gap-2">
                        <button onClick={applyFilters} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all">
                            <Filter size={16} />
                        </button>
                        <button onClick={resetFilters} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 active:scale-95 transition-all">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                <DataTable
                    columns={columns}
                    data={vendors}
                    loading={isLoading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    searchPlaceholder="Search vendors..."
                />
            </div>

            {/* Floating Bulk Action Bar */}
            <AnimatePresence>
                {checkCheckBox.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 flex items-center gap-6 z-50"
                    >
                        <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
                            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                                {checkCheckBox.length}
                            </span>
                            <span className="text-sm font-medium text-slate-700">Selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                            >
                                <Upload size={16} />
                                Export
                            </button>
                            <button
                                onClick={handleEditStart}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                            >
                                <Edit3 size={16} />
                                Edit Info
                            </button>
                            <button
                                onClick={() => initiateAction("DELETE")}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                            {/* Separator */}
                            <div className="w-px h-6 bg-slate-200 mx-2"></div>
                            {/* Approval Actions */}
                            <button
                                onClick={() => initiateAction("APPROVE")}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 rounded-md transition-colors"
                            >
                                <CheckCircle size={16} /> Approve
                            </button>
                            <button
                                onClick={() => initiateAction("DECLINE")}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                                <AlertCircle size={16} /> Decline
                            </button>
                        </div>

                        <button
                            onClick={() => setChecked([])}
                            className="ml-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Confirm Action Modal (for Approve/Decline) --- */}
            {/* 1. Backdrop */}
            <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${actionState.isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>

                {/* 2. Modal Content */}
                <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden transform transition-all duration-300 ease-out ${actionState.isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>

                    {/* Header */}
                    <div className={`px-6 py-4 flex justify-between items-center ${actionState.actionType === 'APPROVE' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <h3 className={`text-lg font-bold flex items-center gap-2 ${actionState.actionType === 'APPROVE' ? 'text-green-800' : 'text-red-800'}`}>
                            {actionState.actionType === 'APPROVE' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            {actionState.actionType === 'APPROVE' ? 'Approve Vendors' : 'Decline Vendors'}
                        </h3>
                        <button onClick={() => dispatch({ type: "CLOSE_MODAL" })} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-white/50 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600">
                            You are about to <strong>{actionState.actionType === 'APPROVE' ? 'approve' : 'decline'}</strong> <span className="font-bold text-slate-900">{checkCheckBox.length}</span> selected vendor(s).
                            {actionState.actionType === 'APPROVE' && " This will grant them access to the platform."}
                        </p>

                        {actionState.actionType === 'DECLINE' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Reason for Rejection <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-none transition-all resize-none"
                                    rows="3"
                                    placeholder="e.g. Incomplete documentation provided..."
                                    value={actionState.remarks}
                                    onChange={(e) => dispatch({ type: "SET_REMARKS", payload: e.target.value })}
                                    autoFocus
                                ></textarea>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            onClick={() => dispatch({ type: "CLOSE_MODAL" })}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-all"
                            disabled={actionState.isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitAction}
                            disabled={actionState.isSubmitting || (actionState.actionType === 'DECLINE' && !actionState.remarks.trim())}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 shadow-sm transition-all transform active:scale-95 ${actionState.actionType === 'APPROVE'
                                ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-200'
                                : 'bg-red-600 hover:bg-red-700 hover:shadow-red-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                        >
                            {actionState.isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Action'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorList;