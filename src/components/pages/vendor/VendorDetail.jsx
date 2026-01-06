import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Mail,
    Phone,
    ShieldCheck,
    Store,
    MessageCircle,
    Star,
    CheckCircle2,
    Package,
    Share2,
    Heart,
    Image as ImageIcon,
    CalendarDays,
    Briefcase,
    TrendingUp,
    Box,
    DollarSign
} from "lucide-react";
import { useVendorDetail } from "../../../hooks/useVendors";

const VendorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");

    const { data, isLoading, isError, error } = useVendorDetail(id);
    const vendor = data?.data;

    // --- Helper Functions ---

    // Handle Image URL (Full URL vs Relative Path)
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `${import.meta.env.VITE_IMGURL}${path}`;
    };

    // Format Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumSignificantDigits: 10
        }).format(amount || 0);
    };

    // Format Date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric"
        });
    };

    // Map Vendor Type ID to Label
    const getVendorTypeLabel = (type) => {
        if (type === "1") return "Shop";
        if (type === "2") return "Designer";
        return "Vendor";
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-500">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <span className="font-medium animate-pulse text-sm">Loading Profile...</span>
            </div>
        );
    }

    // --- Error State ---
    if (isError || !vendor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4">
                <p className="text-red-500 font-medium text-sm">Unable to load details.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm underline"
                >
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-12 pt-8">

            {/* Header / Breadcrumb Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center gap-2 text-sm text-slate-500">
                <button onClick={() => navigate(-1)} className="hover:text-slate-800 transition-colors">Home</button>
                <span>&gt;</span>
                <span className="font-semibold text-slate-900">Vendor Details</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT PANEL (Profile Card) --- */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-center relative h-fit sticky top-6">



                        {/* Profile Image */}
                        <div className="relative mx-auto mb-4 w-32 h-32">
                            <div className="w-full h-full rounded-full border-4 border-slate-50 shadow-inner overflow-hidden flex items-center justify-center bg-slate-100">
                                {vendor.img_path ? (
                                    <img
                                        src={getImageUrl(vendor.img_path)}
                                        alt={vendor.shop_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-slate-300">
                                        {vendor.shop_name?.substring(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {/* Verified Badge */}
                            {vendor.approval_status === "1" && (
                                <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified">
                                    <CheckCircle2 size={14} />
                                </div>
                            )}
                        </div>

                        {/* Name & Title */}
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">{vendor.shop_name}</h1>
                        <p className="text-sm font-medium text-slate-500 mb-1">@{vendor.username}</p>

                        <div className="flex items-center justify-center gap-1.5 text-amber-500 font-medium text-sm mb-4">
                            <span>👑</span> Top Vendor
                        </div>

                        {/* Badges/Tags */}
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-600">
                                Trusted Vendor
                            </span>
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-600">
                                {getVendorTypeLabel(vendor.vendor_type)}
                            </span>
                            {vendor.is_customization === "1" && (
                                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
                                    Customization
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 px-2 line-clamp-4">
                            {vendor.description ||
                                `${vendor.shop_name} is a dedicated ${getVendorTypeLabel(vendor.vendor_type)} focused on delivering quality products and services. Member since ${new Date(vendor.created_at).getFullYear()}.`}
                            <span className="font-semibold text-slate-900 cursor-pointer ml-1 hover:underline">Read More</span>
                        </p>

                        {/* Action Icons Row */}
                        <div className="flex justify-center items-center gap-8 mb-8 border-b border-slate-100 pb-8 w-full">
                            <a href={`mailto:${vendor.email}`} className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="text-slate-400 group-hover:text-slate-800 transition-colors"><Mail size={20} /></div>
                                <span className="text-xs font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 group-hover:text-slate-900">Email</span>
                            </a>
                            <button className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="text-slate-400 group-hover:text-slate-800 transition-colors"><MessageCircle size={20} /></div>
                                <span className="text-xs font-semibold text-slate-600 underline decoration-slate-300 underline-offset-2 group-hover:text-slate-900">Chat</span>
                            </button>

                        </div>

                        {/* Main CTA */}
                        <div className="flex flex-col gap-3 w-full">
                            <button className="w-full py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-orange-400 text-white font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm">
                                Contact Vendor
                            </button>
                            <button
                                onClick={() => navigate(`/products?vendor_id=${vendor.id}`)}
                                className="w-full py-3.5 rounded-full bg-white text-slate-700 font-bold border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 hover:text-purple-600 transition-all transform hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
                            >
                                <Store size={18} /> Show Products
                            </button>
                        </div>
                    </div>


                    {/* --- RIGHT PANEL (Tabs & Content) --- */}
                    <div className="lg:col-span-8">

                        {/* Tabs (Underline Style) */}
                        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-8 sticky top-0 bg-slate-50/95 backdrop-blur z-10 ">
                            {['Overview', 'Gallery', 'Reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`pb-4 text-base font-semibold transition-all whitespace-nowrap border-b-2 ${activeTab === tab.toLowerCase()
                                            ? "border-purple-600 text-purple-700"
                                            : "border-transparent text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="space-y-12">

                            {/* --- Overview Section --- */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in fade-in duration-500">

                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 text-violet-600">
                                                <TrendingUp size={18} />
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sales</span>
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{formatCurrency(vendor.total_sales_amount)}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 text-blue-600">
                                                <Package size={18} />
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Orders</span>
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{vendor.total_orders}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 text-amber-600">
                                                <Box size={18} />
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Products</span>
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">{vendor.total_products}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                                <CheckCircle2 size={18} />
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Settled</span>
                                            </div>
                                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(vendor.total_settled_amount)}</p>
                                        </div>
                                    </div>

                                    {/* Business Information */}
                                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Briefcase size={20} className="text-slate-400" />
                                            Business Information
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    <CalendarDays size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">Joined Date</p>
                                                    <p className="text-slate-900 font-medium">{formatDate(vendor.created_at)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                                    <DollarSign size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">GST Number</p>
                                                    <p className="text-slate-900 font-medium font-mono">{vendor.gst_no || "Not Available"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">PAN Number</p>
                                                    <p className="text-slate-900 font-medium font-mono">{vendor.pan_no || "Not Available"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold uppercase mb-0.5">Pending Orders</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-900 font-bold text-lg">{vendor.total_orders_pending}</span>
                                                        {vendor.total_orders_pending > 0 && (
                                                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Pending</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Media Gallery Section --- */}
                            {(activeTab === 'overview' || activeTab === 'gallery') && (
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <h3 className="text-xl font-bold text-slate-900">Media Gallery</h3>
                                        <button className="text-xs font-medium text-slate-400 hover:text-purple-600 underline decoration-slate-300 underline-offset-2">See More Gallery</button>
                                    </div>

                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                        {/* Main Large Image Placeholder */}
                                        <div className="w-full h-64 bg-slate-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center text-slate-300 relative group">
                                            {vendor.img_path ? (
                                                <img src={getImageUrl(vendor.img_path)} className="w-full h-full object-cover" alt="Gallery Main" />
                                            ) : (
                                                <ImageIcon size={64} />
                                            )}
                                        </div>
                                        {/* Thumbnails */}
                                        <div className="grid grid-cols-4 gap-4">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 hover:bg-slate-100 cursor-pointer transition-colors">
                                                    <ImageIcon size={24} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Reviews Section --- */}
                            {(activeTab === 'overview' || activeTab === 'reviews') && (
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <h3 className="text-xl font-bold text-slate-900">Reviews</h3>
                                        <button className="text-xs font-medium text-slate-400 hover:text-purple-600 underline decoration-slate-300 underline-offset-2">See All Reviews</button>
                                    </div>

                                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                        <div className="flex flex-col items-center text-center mb-8">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-5xl font-extrabold text-slate-900">4.95</span>
                                            </div>
                                            {/* Stars */}
                                            <div className="flex gap-1 text-amber-400 mb-2">
                                                <Star size={24} fill="currentColor" />
                                                <Star size={24} fill="currentColor" />
                                                <Star size={24} fill="currentColor" />
                                                <Star size={24} fill="currentColor" />
                                                <Star size={24} fill="currentColor" />
                                            </div>
                                            <p className="font-bold text-slate-900 text-sm mb-1">Rating & Review</p>
                                            <p className="text-slate-500 text-xs max-w-xs mx-auto">
                                                {vendor.shop_name} is a trusted vendor known for delivering top-quality services.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                                                <span>Overall Rating ({vendor.total_orders || 0} reviews)</span>
                                            </div>
                                            {[5, 4, 3, 2, 1].map((star) => (
                                                <div key={star} className="flex items-center gap-4">
                                                    <span className="w-3 text-xs font-bold text-slate-700">{star}</span>
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-slate-800 rounded-full"
                                                            style={{ width: star === 5 ? '85%' : star === 4 ? '15%' : '0%' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}





                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDetail;