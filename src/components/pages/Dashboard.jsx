import React from "react";
import ReactECharts from "echarts-for-react";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Calendar
} from "lucide-react";

export default function Dashboard() {
  
  // --- 1. Chart Configurations (ECharts) ---

  // Line Chart: Revenue Trend
  const revenueOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      textStyle: { color: '#333' },
      borderWidth: 0,
      shadowBlur: 10,
      shadowColor: 'rgba(0,0,0,0.1)'
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
      axisLabel: { color: '#94a3b8', formatter: '₹{value}' }
    },
    series: [
      {
        name: 'Revenue',
        type: 'line',
        smooth: true,
        lineStyle: { width: 3, color: '#4f46e5' }, // Indigo-600
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(79, 70, 229, 0.2)' },
              { offset: 1, color: 'rgba(79, 70, 229, 0)' }
            ]
          }
        },
        showSymbol: false,
        data: [12000, 18000, 15000, 22000, 28000, 24000, 32000, 38000, 45000]
      }
    ]
  };

  // Pie Chart: Category Distribution
  const categoryOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center', icon: 'circle' },
    series: [
      {
        name: 'Categories',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: '14', fontWeight: 'bold' } },
        data: [
          { value: 1048, name: 'Men', itemStyle: { color: '#3b82f6' } }, // Blue
          { value: 735, name: 'Women', itemStyle: { color: '#ec4899' } }, // Pink
          { value: 580, name: 'Kids', itemStyle: { color: '#f59e0b' } }, // Amber
          { value: 484, name: 'Accessories', itemStyle: { color: '#10b981' } } // Green
        ]
      }
    ]
  };

  // Bar Chart: Top Vendors
  const vendorOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      splitLine: { show: false },
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'category',
      data: ['Zara Store', 'H&M Official', 'Raymonds', 'FabIndia', 'Manyavar'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#64748b', fontWeight: 500 }
    },
    series: [
      {
        name: 'Sales',
        type: 'bar',
        barWidth: '50%',
        itemStyle: { borderRadius: [0, 4, 4, 0], color: '#6366f1' },
        label: { show: true, position: 'right', formatter: '₹{c}' },
        data: [45000, 52000, 61000, 78000, 92000]
      }
    ]
  };

  // --- 2. Dummy Data Components ---

  const StatCard = ({ title, value, change, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon size={22} className={colorClass.replace("bg-", "text-")} />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          {change >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {Math.abs(change)}%
        </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    </div>
  );

  const recentOrders = [
    { id: "#ORD-001", customer: "Rahul Verma", amount: "₹4,500", status: "Completed", color: "bg-green-100 text-green-700" },
    { id: "#ORD-002", customer: "Priya Singh", amount: "₹2,300", status: "Pending", color: "bg-orange-100 text-orange-700" },
    { id: "#ORD-003", customer: "Amit Kumar", amount: "₹8,900", status: "Processing", color: "bg-blue-100 text-blue-700" },
    { id: "#ORD-004", customer: "Sneha Gupta", amount: "₹1,200", status: "Cancelled", color: "bg-red-100 text-red-700" },
    { id: "#ORD-005", customer: "Vikram Roy", amount: "₹12,500", status: "Completed", color: "bg-green-100 text-green-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, Admin. Here is what's happening today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm text-sm font-medium text-slate-600">
          <Calendar size={16} />
          <span>Oct 24, 2025 - Nov 24, 2025</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Revenue" value="₹8,42,000" change={12.5} icon={DollarSign} colorClass="bg-indigo-500" />
        <StatCard title="Total Orders" value="1,254" change={-2.4} icon={ShoppingBag} colorClass="bg-pink-500" />
        <StatCard title="New Customers" value="342" change={8.1} icon={Users} colorClass="bg-blue-500" />
        <StatCard title="Avg. Sale Value" value="₹1,850" change={4.2} icon={TrendingUp} colorClass="bg-emerald-500" />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Line Chart (Revenue) - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Revenue Analytics</h3>
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <ReactECharts option={revenueOption} style={{ height: '350px' }} />
        </div>

        {/* Pie Chart (Categories) - Takes 1 column */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Sales by Category</h3>
            <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
              <MoreHorizontal size={20} />
            </button>
          </div>
          <ReactECharts option={categoryOption} style={{ height: '350px' }} />
        </div>
      </div>

      {/* Bottom Section: Top Vendors & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Performing Vendors */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Top Performing Vendors</h3>
          <ReactECharts option={vendorOption} style={{ height: '300px' }} />
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Recent Orders</h3>
            <a href="#" className="text-sm font-semibold text-indigo-600 hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{order.id}</td>
                    <td className="px-4 py-3 text-slate-600">{order.customer}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{order.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.color}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}