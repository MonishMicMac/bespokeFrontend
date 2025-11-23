import { useEffect, useState } from "react";
import { X, Ruler, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

const VITE_IMGURL = import.meta.env.VITE_IMGURL;

export default function SizeGuide({ isOpen, onClose, productId }) {
  const [activeTab, setActiveTab] = useState("guide"); // 'guide' or 'tips'
  const [unit, setUnit] = useState("in"); // 'in' or 'cm'
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [sizeChartData, setSizeChartData] = useState([]);
  const [measurementImages, setMeasurementImages] = useState([]);
  const [headers, setHeaders] = useState([]);

  // Fetch Data when drawer opens
  useEffect(() => {
    if (isOpen && productId) {
      fetchData();
    }
  }, [isOpen, productId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Size Chart Table Data
      const sizeRes = await api.get(`/product-size-details/${productId}`);
      
      // 2. Fetch How-to-Measure Images
      const measureRes = await api.get(`/product-measurements/${productId}`);

      if (sizeRes.data.status) {
        const rawData = sizeRes.data.data;
        setSizeChartData(rawData);

        // Extract unique measurement names for Table Headers (e.g., Chest, Waist)
        if (rawData.length > 0 && rawData[0].measurements) {
          const extractedHeaders = rawData[0].measurements.map(m => m.measurementName);
          setHeaders(extractedHeaders);
        }
      }

      if (measureRes.data.status) {
        setMeasurementImages(measureRes.data.data);
      }

    } catch (error) {
      console.error("Error fetching size guide", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert value based on unit
  const displayValue = (val) => {
    if (!val) return "-";
    if (unit === "in") return val;
    // Convert Inches to CM (approx)
    return (parseFloat(val) * 2.54).toFixed(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />

          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-slate-900">Shirt Size Guide</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={24} className="text-slate-500"/>
              </button>
            </div>

            {/* Tabs */}
            <div className="p-4">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab("guide")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === "guide" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Size Guide
                </button>
                <button 
                  onClick={() => setActiveTab("tips")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === "tips" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                >
                  Measuring Tips
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : (
                <>
                  {/* --- TAB: SIZE GUIDE --- */}
                  {activeTab === "guide" && (
                    <div className="space-y-6">
                      
                      {/* Fit Tips */}
                      <div className="text-sm text-slate-600 bg-blue-50 p-4 rounded-md border border-blue-100">
                        <h4 className="font-bold text-slate-800 mb-1">Fit Tips</h4>
                        <p>Our shirts are minimal, classic stylish. If you like a tailored fit, pick the size you usually buy. If unsure, always select a larger size.</p>
                      </div>

                      {/* Unit Toggle */}
                      <div className="flex justify-end">
                        <div className="flex border rounded-md overflow-hidden">
                          <button 
                            onClick={() => setUnit("in")}
                            className={`px-4 py-1 text-sm font-medium ${unit === "in" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                          >
                            in
                          </button>
                          <button 
                            onClick={() => setUnit("cm")}
                            className={`px-4 py-1 text-sm font-medium ${unit === "cm" ? "bg-slate-800 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                          >
                            cm
                          </button>
                        </div>
                      </div>

                      {/* The Table */}
                      <div className="overflow-x-auto border rounded-lg shadow-sm">
                        <table className="w-full text-sm text-center">
                          <thead className="bg-slate-600 text-white">
                            <tr>
                              <th className="px-4 py-3 font-medium">Size</th>
                              {headers.map((h, i) => (
                                <th key={i} className="px-4 py-3 font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {sizeChartData.map((row, rowIndex) => (
                              <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
                                <td className="px-4 py-3 font-semibold text-slate-800">
                                  {row.value} <span className="text-slate-400 text-xs font-normal">({row.size})</span>
                                </td>
                                {headers.map((headerName, colIndex) => {
                                  // Find the measurement value matching the header name
                                  const measure = row.measurements.find(m => m.measurementName === headerName);
                                  return (
                                    <td key={colIndex} className="px-4 py-3 text-slate-600">
                                      {displayValue(measure?.details_value)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* --- TAB: MEASURING TIPS --- */}
                  {activeTab === "tips" && (
                    <div className="space-y-6">
                      {measurementImages.length > 0 ? (
                        measurementImages.map((item, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <h4 className="font-bold text-slate-800 mb-2">{item.measurementName}</h4>
                            <div className="aspect-video bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                               {item.reference_image ? (
                                 <img src={VITE_IMGURL + item.reference_image} alt={item.measurementName} className="w-full h-full object-contain" />
                               ) : (
                                 <span className="text-slate-400 text-xs">No Image Available</span>
                               )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Measure carefully around the {item.measurementName.toLowerCase()} area as shown in the image.</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-500">
                          <Ruler className="mx-auto mb-2 opacity-50" size={40} />
                          <p>No measuring tips available for this product.</p>
                        </div>
                      )}
                    </div>
                  )}

                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}