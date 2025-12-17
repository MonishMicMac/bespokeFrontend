import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
    Printer,
    RotateCcw,
    Edit,
    Check,
    Package,
    Truck,
    CheckCircle2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    User,
    Loader2,
    AlertCircle
} from "lucide-react";

// Helper to fetch order details
const fetchOrderDetails = async (id) => {
    const response = await api.get(`/order/detail?order_id=${id}`);
    return response.data;
};

const STEPS = [
    { id: "0", label: "Placed", icon: Check },
    { id: "1", label: "Confirmed", icon: CheckCircle2 },
    { id: "2", label: "Processing", icon: Package },
    { id: "3", label: "Shipped", icon: Truck },
    { id: "4", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderDetail() {
    const { id } = useParams();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['orderDetail', id],
        queryFn: () => fetchOrderDetails(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
        }).format(Number(amount));
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    if (isLoading) {
        return (
            <div className="flex bg-slate-50 items-center justify-center min-h-screen text-pink-600">
                <Loader2 className="animate-spin mr-2" size={24} />
                Loading Order Details...
            </div>
        );
    }

    if (isError || !data?.status) {
        return (
            <div className="flex flex-col bg-slate-50 items-center justify-center min-h-screen text-red-500">
                <AlertCircle size={48} className="mb-4" />
                <h2 className="text-xl font-semibold">Error Loading Order</h2>
                <p className="text-slate-500 mt-2">
                    {error?.message || "Failed to fetch order details. Please try again."}
                </p>
            </div>
        );
    }

    const { orderdetails: order, customerdetails: customer } = data.data;
    const currentStepIndex = STEPS.findIndex(step => step.id === order.orderStatus);

    // Calculate totals if not strictly provided or for safety
    const subtotal = Number(order.subtotal || 0);
    const deliveryCharges = Number(order.extra_charges?.delivery || 0);
    const tax = 0; // Not provided in API response
    const total = subtotal + deliveryCharges + tax;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">

            {/* Top Bar / Breadcrumbs */}
            <div className="mb-6">
                <div className="flex items-center text-sm text-slate-500 mb-2">
                    <span>Orders</span>
                    <span className="mx-2">/</span>
                    <span className="text-pink-600 font-medium">Order #{order.OrderId}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">Order #{order.OrderId}</h1>
                            <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold border border-pink-200">
                                {STEPS.find(s => s.id === order.orderStatus)?.label || "Unknown"}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            Placed on {formatDate(order.placed_time_and_date)} via Web Store
                        </p>
                    </div>

             
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Order Status Timeline */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-8 text-slate-900">Order Status</h3>
                        <div className="relative flex justify-between">
                            {/* Progress Bar Background */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />

                            {/* Active Progress Bar */}
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-pink-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                                style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}
                            />

                            {STEPS.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;

                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                        <div
                                            className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300
                        ${isCompleted
                                                    ? 'bg-pink-600 border-white text-white shadow-md'
                                                    : 'bg-slate-100 border-white text-slate-400'}
                        ${isCurrent ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-white' : ''}
                      `}
                                        >
                                            <step.icon size={16} />
                                        </div>
                                        <span
                                            className={`text-xs font-medium ${isCompleted ? 'text-pink-600' : 'text-slate-500'}`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>
                            <span className="text-xs px-2 py-1 bg-pink-50 text-pink-700 rounded-md font-medium border border-pink-100">
                                {order.orderItems?.length || 0} Items
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-500 uppercase text-xs bg-slate-50/50">
                                        <th className="px-6 py-4 font-medium">Product</th>
                                        <th className="px-6 py-4 font-medium text-right">Price</th>
                                        <th className="px-6 py-4 font-medium text-center">Qty</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {order.orderItems?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-pink-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                        {/* Fallback image */}
                                                        <img
                                                            src={item.img || "https://placehold.co/100x100/f1f5f9/475569?text=IMG"}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{item.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {item.saleorderid ? `ID: ${item.saleorderid}` : ''}
                                                            {item.sku ? ` • SKU: ${item.sku}` : ''}
                                                            {item.size ? ` • Size: ${item.size}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-600">
                                                {formatCurrency(item.price)}
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-600">
                                                {item.qty}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-900">
                                                {formatCurrency(item.total_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <div className="flex flex-col gap-3 ml-auto w-full md:w-1/2 lg:w-1/3">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span>{formatCurrency(deliveryCharges)}</span>
                                </div>
                                <div className="h-px bg-slate-200 my-1" />
                                <div className="flex justify-between text-lg font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                                <div className="flex items-center justify-between mt-2 px-3 py-2 bg-white rounded-lg text-xs text-slate-500 border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={14} className="text-slate-400" />
                                        <span>Paid via Visa **** 4242</span>
                                    </div>
                                    <span className="text-green-600 font-medium">Paid</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Timeline (Placeholder) */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900">Activity Timeline</h3>
                        <div className="space-y-4 relative pl-4 border-l border-slate-200">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-pink-500 ring-4 ring-white shadow-sm"></div>
                                <p className="text-sm text-slate-700">Order confirmation email sent</p>
                                <p className="text-xs text-slate-400 mt-1">{formatDate(order.placed_time_and_date)}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">

                    {/* Customer Card */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-900">Customer</h3>
                            <button className="text-xs text-pink-600 font-bold hover:text-pink-700">VIEW PROFILE</button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">{customer.name}</p>
                                <p className="text-sm text-slate-500">{customer.previous_order_count} Previous orders</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail size={16} className="text-slate-400" />
                                <span>{customer.gmail}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone size={16} className="text-slate-400" />
                                <span>+91 {customer.contact}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6 text-slate-900">Delivery Details</h3>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Address</p>
                                <div className="text-sm text-slate-600 leading-relaxed">
                                    <p className="font-medium text-slate-900">{order.deliveryaddress?.name}</p>
                                    <p>{order.deliveryaddress?.house_building_name}, {order.deliveryaddress?.area_colony}</p>
                                    <p>{order.deliveryaddress?.landmark_nearby}</p>
                                    <p>{order.deliveryaddress?.city}, {order.deliveryaddress?.state} {order.deliveryaddress?.pincode}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Address</p>
                                <p className="text-sm text-slate-600">Same as shipping address</p>
                            </div>

                            {/* Map Placeholder */}
                            <div className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-pink-200 transition-colors">
                                <MapPin className="text-slate-400 group-hover:text-pink-500 transition-colors" size={32} />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900">Internal Notes</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 italic">
                            "Customer called requested to leave package at front door if no answer."
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}