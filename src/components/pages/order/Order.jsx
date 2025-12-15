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

// --- Mock Data ---
const MOCK_ORDERS = [
  {
    id: "ER84782",
    date: "2 Oct 2024",
    customer: {
      name: "Leslie Alexander",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    },
    items: 4,
    total: 374,
    paymentStatus: "Pending",
  },
  {
    id: "ER84784",
    date: "4 Oct 2024",
    customer: {
      name: "Robert Fox",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    },
    items: 8,
    total: 824,
    paymentStatus: "Success",
  }
];

export default function Order() {
  const [selectedIds, setSelectedIds] = useState([]);


useEffect(() => {
  connectSocket(import.meta.env.VITE_WEBSOCKET_URL);

  const handler = () => {
    console.log("message come from backend");
    fetchData();
  };

  onSocketEvent("order-event", handler);

  return () => {
    offSocketEvent("order-event", handler); // remove duplicate listener
  };
}, []);


  const fetchData=()=>{
    console.log("fetch data single order")
  }
  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(MOCK_ORDERS.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const isAllSelected = MOCK_ORDERS.length > 0 && selectedIds.length === MOCK_ORDERS.length;

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
            checked={selectedIds.includes(row.id)}
            onChange={() => handleSelectOne(row.id)}
          />
        </div>
      )
    },
    {
      header: "Orders",
      render: (row) => <span className="font-medium text-slate-900">#{row.id}</span>
    },
    {
      header: "Date",
      accessor: "date",
      className: "text-slate-500"
    },
    {
      header: "Customer",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.customer.avatar}
            alt={row.customer.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium text-slate-700">{row.customer.name}</span>
        </div>
      )
    },
    {
      header: "Delivery",
      render: () => <span className="text-slate-500">N/A</span>
    },
    {
      header: "Items",
      render: (row) => <span className="text-slate-700">{row.items} Items</span>
    },
    {
      header: "Total",
      render: (row) => <span className="font-semibold text-slate-800">${row.total}</span>
    },
    {
      header: "Payment",
      render: (row) => {
        const isSuccess = row.paymentStatus === "Success";
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isSuccess
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isSuccess ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            {row.paymentStatus}
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
          data={MOCK_ORDERS}
          loading={false}
          pagination={{ from: 1, to: MOCK_ORDERS.length, total: MOCK_ORDERS.length, current_page: 1, last_page: 1 }}
          onPageChange={() => { }}
          onSearch={() => { }}
          searchTerm=""
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
