import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductDetails } from '../../../services/vendorService';
import toast from 'react-hot-toast';
import api from '../../../api/axios';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0, 1, 2... for materials, 'measurements' for measurement tab
  const [previewImage, setPreviewImage] = useState(null);

  // API Base URL for relative images
  const ASSET_BASE_URL = 'http://3.7.112.78/bespoke/public';

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${ASSET_BASE_URL}${cleanPath}`;
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms?page=1&search=&per_page=50');
      let roomsList = [];
      if (Array.isArray(res.data)) {
        roomsList = res.data;
      } else if (res.data?.rooms?.data) {
        roomsList = res.data.rooms.data;
      } else if (res.data?.data) {
        roomsList = res.data.data;
      }
      setRooms(roomsList);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await getProductDetails(id);
      // The response from getProductDetails is already calling api.get
      const productData = response.data?.data || response.data || response;

      if (productData && productData.product_name) {
        setProduct(productData);
      } else {
        toast.error("Invalid product data received");
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetails();
      fetchRooms();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Product not found</h2>
        <Link to="/products" className="text-rose-500 hover:underline">Back to Products</Link>
      </div>
    );
  }

  // --- DERIVED DATA ---
  const isMeasurementTab = activeTab === 'measurements';
  const material = !isMeasurementTab ? (product.product_materials || [])[activeTab] : null;

  const selectedRoom = rooms.find(r => String(r.id) === String(product.room_id));
  const mainImgUrl = getFullImageUrl(product.main_image);

  // Get unique sizes for the measurement table
  let allSizes = [];
  if (product.product_measurements && product.product_measurements.length > 0) {
    const firstValue = product.product_measurements[0].value || {};
    allSizes = Object.keys(firstValue);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12 font-sans text-slate-800 dark:text-slate-200">
      {/* 1. HEADER */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Link to="/products" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors mt-1">
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{product.product_name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">ID: {product.id}</span>
                  <span>•</span>
                  <span>{product.vendor?.shop_name}</span>
                  <span>•</span>
                  <span>{product.category_name || product.category?.name || 'N/A'} / {product.sub_category_name || product.subcategory?.name || 'N/A'}</span>
                  {(product.room_name || product.roomName || selectedRoom) && (
                    <>
                      <span>•</span>
                      <span className="text-rose-500 font-black tracking-widest">
                        {product.room_name || product.roomName || selectedRoom?.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-[0.2em] border ${product.is_customizable === 1 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {product.is_customizable === 1 ? 'Customizable' : 'Ready-Made'}
              </span>

            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 2. TABS SELECTOR */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          {(product.product_materials || []).map((mat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === idx
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              <span className="material-symbols-outlined text-sm">texture</span>
              {mat.material_name || mat.name || `Material ${idx + 1}`}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('measurements')}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'measurements'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
          >
            <span className="material-symbols-outlined text-sm">straighten</span>
            Measurements
          </button>
        </div>

        {/* 3. CONTENT AREA */}
        {!isMeasurementTab ? (
          /* MATERIAL VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Material Info & Pricing */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <span className="material-symbols-outlined text-3xl">info</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Fabric Information</h2>
                    <p className="text-sm font-medium text-slate-500">{material?.material_name || material?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Room</label>
                    <span className="text-sm font-black text-rose-500 uppercase">{product.room_name || product.roomName || selectedRoom?.name || 'N/A'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{product.category_name || product.category?.name || 'N/A'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subcategory</label>
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{product.sub_category_name || product.subcategory?.name || 'N/A'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gender</label>
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{product.gender}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Alteration</label>
                    <span className={`text-sm font-black uppercase ${product.is_alter == "1" ? 'text-green-600' : 'text-slate-400'}`}>
                      {product.is_alter == "1" ? `Yes (₹${product.alter_charge})` : 'No'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                    <span className={`text-sm font-black uppercase ${product.action == "0" ? 'text-amber-500' : 'text-green-500'}`}>
                      {product.action == "0" ? 'INACTIVE' : 'ACTIVE'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Description</label>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-700 dark:text-slate-300 leading-relaxed text-sm border border-slate-100 dark:border-slate-700 min-h-[100px]">
                    {material?.description || product.description || "No specific description."}
                  </div>
                </div>
              </div>

              {/* Product Addons */}
              {material && ((material.addons && material.addons.length > 0) || (material.product_addons && material.product_addons.length > 0)) && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500">
                      <span className="material-symbols-outlined">add_circle</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Available Addons</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(material.addons || material.product_addons).map((addon, aIdx) => (
                      <div key={aIdx}
                        onClick={() => setPreviewImage(getFullImageUrl(addon.images?.[0]?.img_path || addon.img_path || addon.image))}
                        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-rose-200 transition-all group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm flex-shrink-0">
                          <img
                            src={getFullImageUrl(addon.images?.[0]?.img_path || addon.img_path || addon.image)}
                            alt={addon.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Addon'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{addon.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-rose-500">₹{parseFloat(addon.amount || addon.price || 0).toFixed(0)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {/* Ready-made Table */}
                {material?.prices?.some(pr => pr.price_type === 'ready' || pr.price_type_id == 2) && (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Ready-made Pricing</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm uppercase font-bold">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-500 tracking-widest">
                          <tr>
                            <th className="px-8 py-4">Size</th>
                            <th className="px-8 py-4 text-center">Regular Price</th>
                            <th className="px-8 py-4 text-center">Offer Price</th>
                            <th className="px-8 py-4 text-center">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {material.prices.filter(pr => pr.price_type === 'ready' || pr.price_type_id == 2).map((pr, pIdx) => (
                            <tr key={pIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="px-8 py-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-black text-[11px] shadow-sm">
                                  {pr.size}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-center text-slate-400 line-through">₹{parseFloat(pr.actual_price).toFixed(0)}</td>
                              <td className="px-8 py-4 text-center text-slate-900 dark:text-white font-black">₹{parseFloat(pr.discount_price).toFixed(0)}</td>
                              <td className="px-8 py-4 text-center">
                                <span className={`px-2 py-1 rounded text-[10px] ${pr.qty > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                  {pr.qty > 0 ? `${pr.qty} IN STOCK` : 'OUT OF STOCK'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Custom Table */}
                {material?.prices?.some(pr => pr.price_type === 'custom' || pr.price_type_id == 1 || pr.price_type_id == 0) && (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                      <h3 className="text-lg font-black text-rose-500 uppercase tracking-tight">Custom Pricing</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm uppercase font-bold">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] text-slate-500 tracking-widest">
                          <tr>
                            <th className="px-8 py-4">Size</th>
                            <th className="px-8 py-4 text-center">Regular Price</th>
                            <th className="px-8 py-4 text-center text-rose-500">Custom Offer Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {material.prices.filter(pr => pr.price_type === 'custom' || pr.price_type_id == 1 || pr.price_type_id == 0).map((pr, pIdx) => (
                            <tr key={pIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="px-8 py-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-black text-[11px] shadow-sm">
                                  {pr.size}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-center text-slate-400 line-through">₹{parseFloat(pr.actual_price).toFixed(0)}</td>
                              <td className="px-8 py-4 text-center text-rose-600 font-black">₹{parseFloat(pr.discount_price).toFixed(0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Material Photos */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 sticky top-28">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 underline decoration-rose-500 underline-offset-4">Material Gallery</label>

                {/* Featured Image */}
                <div
                  onClick={() => setPreviewImage(getFullImageUrl(material?.images?.[0]?.img_path) || mainImgUrl)}
                  className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 mb-4 border border-slate-100 dark:border-slate-700 shadow-inner cursor-zoom-in group"
                >
                  <img
                    src={getFullImageUrl(material?.images?.[0]?.img_path) || mainImgUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    alt="Featured"
                  />
                </div>

                {/* Others Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {material?.images?.slice(1).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setPreviewImage(getFullImageUrl(img.img_path))}
                      className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-rose-500 transition-colors cursor-zoom-in group"
                    >
                      <img src={getFullImageUrl(img.img_path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Gallery" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MEASUREMENTS VIEW */
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-8 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 font-bold">
                  <span className="material-symbols-outlined text-3xl">straighten</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Size & Measurement Matrix</h2>
                  <p className="text-sm font-medium text-slate-500 underline decoration-sky-600 underline-offset-4 decoration-2">Complete size chart for all measurement points</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-900 dark:border-slate-700 shadow-xl">
                <table className="w-full text-left text-xs font-black uppercase tracking-tight border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="px-6 py-4 border-r border-slate-700">Measurement Point</th>
                      {allSizes.map(size => (
                        <th key={size} className="px-6 py-4 text-center border-r border-slate-700 last:border-0">{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-bold">
                    {product.product_measurements?.map((m, mIdx) => (
                      <tr key={mIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 sticky left-0 z-10 w-fit whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
                            {m.measurement?.name || m.name}
                          </div>
                        </td>
                        {allSizes.map(size => (
                          <td key={size} className="px-6 py-4 text-center border-r border-slate-100 dark:border-slate-700/50 last:border-0 font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800">
                            {m.value?.[size]?.[`meas_${m.measurement_id}`] || '---'}
                            <span className="text-[8px] text-slate-400 ml-0.5">IN</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Points Cards (Small Gallery) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Selected Points Guides</h3>
              <div className="flex flex-wrap gap-6">
                {product.product_measurements?.map((m, i) => {
                  const listInfo = product.measurements_list?.find(ml => ml.measurement_id === m.measurement_id);
                  const imgUrl = listInfo?.measurement_image || m.measurement?.img_path;

                  return (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
                        {imgUrl ? (
                          <img
                            src={getFullImageUrl(imgUrl)}
                            className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-transform duration-500"
                            alt="Guide"
                            onClick={() => setPreviewImage(getFullImageUrl(imgUrl))}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                            <span className="material-symbols-outlined text-4xl">image</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-600 text-center max-w-[110px]">{m.measurement?.name || m.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/10 shadow-xl"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div
            className="relative max-w-5xl w-full h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
