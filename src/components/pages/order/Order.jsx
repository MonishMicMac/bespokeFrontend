import React, { useEffect, useState } from "react";
import {
  MoreVertical,
  Upload,
  Edit3,
  Trash2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "../../ui/DataTable";
import { connectSocket, offSocketEvent, onSocketEvent } from "../../../utils/socket";
import { useOrderList } from "../../../hooks/useOrders";

export default function Order() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: orderData, isLoading } = useOrderList({ page, search });
  const orders = orderData?.data || [];
  const pagination = orderData?.pagination || {};

  useEffect(() => {
    connectSocket(import.meta.env.VITE_WEBSOCKET_URL);

    const handler = () => {
      console.log("message come from backend");
      // queryClient.invalidateQueries(["orders"]) // Ideally we should use queryClient here if available in context or imported
    };

    onSocketEvent("order-event", handler);

    return () => {
      offSocketEvent("order-event", handler); // remove duplicate listener
    };
  }, []);


  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.order_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  // Columns
  const columns = [
    {
      header: (
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            checked={isAllSelected}
            onChange={handleSelectAll}
          />
        </div>
      ),
      className: "w-10",
      render: (row) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            checked={selectedIds.includes(row.order_id)}
            onChange={() => handleSelectOne(row.order_id)}
          />
        </div>
      )
    },
    {
      header: "Orders",
      render: (row) => <span className="font-medium text-slate-900">#{row.order_id}</span>
    },
    {
      header: "Date",
      accessor: "order_date",
      className: "text-slate-500"
    },
    {
      header: "Customer",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-xs">
            {row.customer_name?.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-slate-700">{row.customer_name}</span>
        </div>
      )
    },
    {
      header: "Status", // Changed from Delivery based on API mapping
      render: (row) => <span className="text-slate-500">{row.status}</span>
    },
    {
      header: "Items",
      render: (row) => <span className="text-slate-700">{row.number_of_items} Items</span>
    },
    {
      header: "Total",
      render: (row) => <span className="font-semibold text-slate-800">${row.total_amount}</span>
    },
    {
      header: "Payment",
      render: (row) => {
        const isSuccess = row.payment_status === "Success" || row.payment_status === "Paid"; // Adjusted for potential API values
        const isPending = row.payment_status === "Pending";

        // Define styles
        let bgClass = "bg-gray-50 text-gray-700 border-gray-200";
        let dotClass = "bg-gray-500";

        if (isSuccess) {
          bgClass = "bg-green-50 text-green-700 border-green-200";
          dotClass = "bg-green-500";
        } else if (isPending) {
          bgClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
          dotClass = "bg-yellow-500";
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${dotClass}`}></span>
            {row.payment_status}
          </span>
        )
      }
    },
    {
      header: "Action",
      className: "text-right",
      render: () => (
        <div className="flex justify-end">
          <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
            <MoreVertical size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 relative">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={orders}
          loading={isLoading}
          pagination={{
            from: (pagination.current_page - 1) * pagination.per_page + 1,
            to: Math.min(pagination.current_page * pagination.per_page, pagination.total),
            total: pagination.total,
            current_page: pagination.current_page,
            last_page: pagination.last_page
          }}
          onPageChange={(p) => setPage(p)}
          onSearch={(s) => { setSearch(s); setPage(1); }}
          searchTerm={search}
          searchPlaceholder="Search orders..."
        />
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-xl px-4 py-3 flex items-center gap-6 z-50"
          >
            <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
              <span className="bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                {selectedIds.length}
              </span>
              <span className="text-sm font-medium text-slate-700">Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
                <Upload size={16} />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
                <Edit3 size={16} />
                Edit Info
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 size={16} />
                Delete
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="ml-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

