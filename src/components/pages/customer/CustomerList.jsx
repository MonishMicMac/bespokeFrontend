import React, { useState } from "react";
import DataTable from "../../ui/DataTable";
import { toast } from "react-toastify";
import { Filter, RotateCcw } from "lucide-react";
import { useCustomers } from "../../../hooks/useCustomers";

const CustomerList = () => {
    // Local state for inputs (uncommitted filters)
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState({
        from_date: "",
        to_date: "",
    });

    // Query Params State (Committed filters that trigger refetch)
    const [queryParams, setQueryParams] = useState({
        page: 1,
        search: "",
        from_date: "",
        to_date: "",
    });

    // React Query Hook
    const { data, isLoading, isError, error } = useCustomers(queryParams);

    // Derived Data
    const customers = data?.data?.data || [];
    const meta = data?.data || {};

    const pagination = {
        current_page: meta.current_page || 1,
        last_page: meta.last_page || 1,
        total: meta.total || 0,
        from: meta.from || 0,
        to: meta.to || 0,
    };

    // Handlers
    const handlePageChange = (newPage) => {
        setQueryParams((prev) => ({ ...prev, page: newPage }));
    };

    // Update query params when search is submitted (or usually on change if desired, keeping original behavior of explicit call behavior but wrapped)
    // Original: handleSearch called fetch(1, term)
    const handleSearch = (term) => {
        setSearchTerm(term);
        setQueryParams((prev) => ({ ...prev, page: 1, search: term }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateFilter((prev) => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setQueryParams((prev) => ({
            ...prev,
            page: 1,
            search: searchTerm,
            from_date: dateFilter.from_date,
            to_date: dateFilter.to_date,
        }));
    };

    const resetFilters = () => {
        const resetDates = { from_date: "", to_date: "" };
        setDateFilter(resetDates);
        setSearchTerm("");
        setQueryParams({
            page: 1,
            search: "",
            from_date: "",
            to_date: "",
        });
    };

    if (isError) {
        toast.error(error?.message || "Failed to fetch customer list");
    }

    // Columns Configuration
    const columns = [
        {
            header: "So No",
            accessor: "id",
            className: "w-16",
            render: (_row, index) => (
        <span className="text-slate-500 text-xs">
            {(pagination.from || 1) + index}
        </span>
    )
        },
        {
            header: "Image",
            accessor: "img_path",
            render: (row) => (
                row.img_path ? (
                    <img
                        src={row.img_path.startsWith('http') ? row.img_path : `${import.meta.env.VITE_IMGURL}${row.img_path}`}
                        alt={row.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                        {row.username?.substring(0, 2)?.toUpperCase()}
                    </div>
                )
            )
        },
        {
            header: "Username",
            accessor: "username",
            className: "font-medium text-slate-800"
        },
        {
            header: "Mobile",
            accessor: "mobile"
        },
        {
            header: "Email",
            accessor: "email"
        },
        {
            header: "Status",
            accessor: "is_banned",
            render: (row) => (
                row.is_banned === "1" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        Banned
                    </span>
                ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        Active
                    </span>
                )
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Customer Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all registered customers.</p>
                </div>
            </div>

            {/* Filter Stats Section */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-end gap-4">

                    <div className="w-full md:w-auto">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">From Date</label>
                        <input
                            type="date"
                            name="from_date"
                            value={dateFilter.from_date}
                            onChange={handleDateChange}
                            className="w-full md:w-48 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="w-full md:w-auto">
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">To Date</label>
                        <input
                            type="date"
                            name="to_date"
                            value={dateFilter.to_date}
                            onChange={handleDateChange}
                            className="w-full md:w-48 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={applyFilters}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Filter size={16} /> Filter
                        </button>
                        <button
                            onClick={resetFilters}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors"
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-[600px]">
                <DataTable
                    columns={columns}
                    data={customers}
                    loading={isLoading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    searchPlaceholder="Search by name, email or mobile..."
                />
            </div>
        </div>
    );
};

export default CustomerList;
