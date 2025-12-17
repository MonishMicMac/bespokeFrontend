import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Upload,
  Edit3,
  Trash2,
  X,
  Wallet,
  ShoppingCart,
  Clock,
  Truck,
  Calendar,
  Filter,
  Download,
  Search,
  Plus,
  Bell,
  ShoppingBag,
  Eye,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "../../ui/DataTable";
import { connectSocket, offSocketEvent, onSocketEvent } from "../../../utils/socket";
import { useOrderList } from "../../../hooks/useOrders";

const STATS = [
  {
    label: "Total Revenue",
    value: "$48,250",
    trend: "+12.5%",
    trendUp: true,
    icon: Wallet,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    label: "Total Orders",
    value: "1,254",
    trend: "+5.2%",
    trendUp: true,
    icon: ShoppingCart,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Pending Orders",
    value: "45",
    status: "Needs Attention",
    statusColor: "bg-orange-100 text-orange-700",
    icon: Clock,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "Delivered",
    value: "892",
    status: "This Month",
    statusColor: "bg-purple-100 text-purple-700",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const TABS = ["All Orders", "Pending", "Paid", "Unpaid", "Cancelled"];

export default function Order() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Orders");
  const navigate = useNavigate();

  const { data: orderData, isLoading } = useOrderList({ page, search });
  const orders = orderData?.data || [];
  const pagination = orderData?.pagination || {};

  useEffect(() => {
    connectSocket(import.meta.env.VITE_WEBSOCKET_URL);
    const handler = () => { console.log("message come from backend"); };
    onSocketEvent("order-event", handler);
    return () => { offSocketEvent("order-event", handler); };
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.order_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  // Columns Configuration
  const columns = [
    {
      header: (
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
          checked={isAllSelected}
          onChange={handleSelectAll}
        />
      ),
      className: "w-10 pl-4",
      render: (row) => (
        <div className="pl-4">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 cursor-pointer"
            checked={selectedIds.includes(row.order_id)}
            onChange={() => handleSelectOne(row.order_id)}
          />
        </div>
      )
    },
    {
      header: "ORDER ID",
      render: (row) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-400 mt-1">
            <ShoppingBag size={18} />
          </div>
          <div>
            <span
              onClick={() => row.id && navigate(`/orderDetails/${row.id}`)}
              className="block font-bold text-slate-900 hover:text-pink-600 cursor-pointer transition-colors"
            >
              #{row.order_id}
            </span>
            <div className="text-xs text-slate-500 mt-1 leading-relaxed">
              <p>{row.order_date || "Oct 24, 2023"}</p>
              <p>10:42 AM</p>
            </div>
          </div>
        </div>
      )
    },
    {
      header: "CUSTOMER",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm
            ${['bg-blue-600', 'bg-pink-600', 'bg-purple-600', 'bg-indigo-600'][row.id % 4]}
          `}>
            {row.customer_name?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.customer_name}</p>
            <p className="text-xs text-slate-500">
              {row.customer_email || "customer@example.com"}
            </p>
          </div>
        </div>
      )
    },
    {
      header: "STATUS",
      render: (row) => {
        const paymentStatus = row.payment_status || "Pending";
        const isPaid = ["Paid", "Success"].includes(paymentStatus);

        return (
          <div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold
                    ${isPaid ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}
                `}>
              {paymentStatus}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-medium">
              <CreditCard size={12} className="text-slate-400" />
              <span>Mastercard **4242</span>
            </div>
          </div>
        )
      }
    },
    {
      header: "FULFILLMENT",
      tdClassName: "w-[200px]",
      render: (row) => {
        const status = row.status || "Processing";
        const progress = status.toLowerCase() === 'delivered' ? 100 : status.toLowerCase() === 'shipped' ? 75 : 35;

        let color = "bg-orange-500";
        if (status.toLowerCase() === 'delivered') color = "bg-green-500";
        if (status.toLowerCase() === 'shipped') color = "bg-blue-500";
        if (status.toLowerCase() === 'cancelled') color = "bg-red-500";

        return (
          <div className="w-full max-w-[180px]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className={`font-semibold ${status.toLowerCase().includes('processing') ? 'text-orange-600' :
                  status.toLowerCase().includes('shipped') ? 'text-blue-600' :
                    status.toLowerCase().includes('delivered') ? 'text-green-600' : 'text-slate-600'
                }`}>{status}</span>
              <span className="text-slate-400">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${progress}%` }}></div>
            </div>
        
          </div>
        )
      }
    },
    {
      header: "TOTAL",
      className: "text-right",
      render: (row) => (
        <div className="text-right">
          <span className="font-bold text-slate-900 text-sm block">
            {row.total_amount}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            {row.number_of_items} items
          </span>
        </div>
      )
    },
    {
      header: "ACTION",
      className: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => row.id && navigate(`/orderDetails/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order Management</h1>
            <div className="flex items-center text-xs text-slate-500 mt-1">
              <span>Dashboard</span>
              <span className="mx-2">/</span>
              <span className="text-pink-600 font-medium">Order List</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 outline-none focus:ring-2 focus:ring-pink-500/20 text-slate-600 transition-all focus:bg-white focus:shadow-sm"
              />
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-slate-900/20">
              <Plus size={16} />
              Create Order
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-[1600px] mx-auto">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {STATS.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                {stat.trend ? (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {stat.trend}
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${stat.statusColor}`}>
                    {stat.status}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">{stat.value}</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar & Tabs */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto max-w-full">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${activeTab === tab
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <Filter size={18} />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={orders}
            loading={isLoading}
            pagination={{
              from: (pagination.current_page - 1) * pagination.per_page + 1 || 1,
              to: Math.min(pagination.current_page * pagination.per_page, pagination.total) || 10,
              total: pagination.total || 0,
              current_page: pagination.current_page || 1,
              last_page: pagination.last_page || 1
            }}
            onPageChange={setPage}
          />
        </div>

      </div>

      {/* Bulk Actions Floating Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-8 z-50 ring-1 ring-white/10"
          >
            <div className="flex items-center gap-3 border-r border-white/20 pr-6">
              <span className="bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                {selectedIds.length}
              </span>
              <span className="text-sm font-medium">Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative" title="Export">
                <Upload size={18} className="text-slate-300 group-hover:text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative" title="Edit">
                <Edit3 size={18} className="text-slate-300 group-hover:text-white" />
              </button>
              <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group relative" title="Delete">
                <Trash2 size={18} className="text-red-400 group-hover:text-red-300" />
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
