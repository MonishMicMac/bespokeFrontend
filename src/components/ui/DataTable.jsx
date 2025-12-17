import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox
} from "lucide-react";

export default function DataTable({
  columns,
  data,
  pagination,
  onPageChange,
  onSearch,
  searchTerm,
  loading,
  searchPlaceholder = "Search...",
  onRowClick
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">

      {/* 1. Toolbar / Search */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <h3 className="font-semibold text-slate-800">
          List View <span className="text-slate-400 text-xs font-normal ml-1">({pagination?.total || 0} Total)</span>
        </h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* 2. The Table */}
      <div className="relative overflow-x-auto flex-1 min-h-[300px]">

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/80 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={30} />
          </div>
        )}

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 font-semibold text-slate-600 uppercase text-xs tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="wait">
              {!loading && data.length === 0 ? (
                // Empty State
                <motion.tr
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white"
                >
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="p-3 bg-slate-100 rounded-full">
                        <Inbox size={24} className="text-slate-400" />
                      </div>
                      <p>No records found.</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                // Data Rows
                data.map((row, rowIndex) => (
                  <motion.tr
                    key={row.id || rowIndex}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`hover:bg-slate-50 transition-colors duration-150 group bg-white ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={`px-4 py-3 ${col.tdClassName || ''}`}>
                        {/* If a custom render function is provided, use it. Otherwise display the data field */}
                        {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer */}
      {pagination && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold">{pagination.from || 0}</span> to <span className="font-semibold">{pagination.to || 0}</span>
          </div>
          <div className="flex gap-2">
            <button
              disabled={pagination.current_page === 1}
              onClick={() => onPageChange(pagination.current_page - 1)}
              className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.current_page === pagination.last_page || pagination.last_page === 0}
              onClick={() => onPageChange(pagination.current_page + 1)}
              className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}