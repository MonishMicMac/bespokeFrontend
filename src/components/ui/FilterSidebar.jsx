import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import api from "../../api/axios";

export default function FilterSidebar({ onFilterChange, initialFilters }) {


  // --- Data State ---
  const [masterData, setMasterData] = useState({
    categories: [],
    subcategories: [],
    vendors: []
  });

  // --- Selection State ---
  const [selectedFilters, setSelectedFilters] = useState({
    category_id: [],
    subcategory_id: [],
    vendor_id: []
  });

  // --- 1. Fetch Filter Data ---
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Call the NEW endpoint we just created
        const res = await api.get('/products/filter-meta');
        if (res.data.status) {
          setMasterData(res.data.data);
        }
      } catch (error) {
        console.error("Error loading filters", error);
      }
    };
    fetchFilters();
  }, []);

  // Sync with prop if provided (e.g. from URL params)
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.vendor_id?.length || initialFilters.category_id?.length || initialFilters.subcategory_id?.length) {
        setSelectedFilters(prev => ({
          ...prev,
          ...initialFilters
        }));
      }
    }
  }, [initialFilters]);

  // --- 2. Handle Checkbox Changes ---
  const handleCheck = (type, id) => {


    const newFilters = { ...selectedFilters };
    const idStr = String(id);

    // Toggle logic
    // Check if exists (comparing strings)
    const exists = newFilters[type].some(item => String(item) === idStr);

    if (exists) {
      newFilters[type] = newFilters[type].filter(item => String(item) !== idStr);

      // Special Case: If unchecking a category, clear dependent subcategories? 
      // (Optional, kept simple for now)
    } else {
      // Enforce Single Select for Vendor
      if (type === 'vendor_id') {
        newFilters[type] = [idStr];
      } else {
        newFilters[type].push(idStr);
      }
    }

    setSelectedFilters(newFilters);
    onFilterChange(newFilters); // Send up to parent
  };

  // --- 3. Clear All ---
  const clearFilters = () => {
    const reset = { category_id: [], subcategory_id: [], vendor_id: [] };

    setSelectedFilters(reset);
    onFilterChange(reset);
  };

  // --- 4. Helper: Get displayed subcategories ---
  // If a Category is selected, only show its subcategories. 
  // If no category selected, show all.
  const displayedSubcategories = selectedFilters.category_id.length > 0
    ? masterData.subcategories.filter(sub => selectedFilters.category_id.includes(sub.category_id))
    : masterData.subcategories;

  return (
    <div className="w-64 border-r min-h-screen bg-white hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto custom-scrollbar">

      {/* Header */}
      <div className="p-5 border-b flex items-center justify-between bg-white z-10">
        <h3 className="font-bold text-lg uppercase tracking-wide flex items-center gap-2">
          <Filter size={18} /> Filters
        </h3>
        <button
          onClick={clearFilters}
          className="text-xs text-pink-600 font-bold hover:text-pink-800 uppercase"
        >
          Clear All
        </button>
      </div>

      <div className="p-5 space-y-8">

        {/* --- 1. Categories --- */}
        <div className="border-b pb-6">
          <h4 className="font-bold text-sm mb-3 text-slate-800 uppercase tracking-wider">Categories</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {masterData.categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 checked:border-pink-500 checked:bg-pink-500 transition-all"
                    checked={selectedFilters.category_id.map(String).includes(String(cat.id))}
                    onChange={() => handleCheck('category_id', cat.id)}
                  />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                <span className={`text-sm group-hover:text-pink-600 transition-colors ${selectedFilters.category_id.includes(cat.id) ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* --- 2. Subcategories --- */}
        <div className="border-b pb-6">
          <h4 className="font-bold text-sm mb-3 text-slate-800 uppercase tracking-wider">Sub Categories</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {displayedSubcategories.length > 0 ? (
              displayedSubcategories.map(sub => (
                <label key={sub.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 checked:border-pink-500 checked:bg-pink-500 transition-all"
                      checked={selectedFilters.subcategory_id.map(String).includes(String(sub.id))}
                      onChange={() => handleCheck('subcategory_id', sub.id)}
                    />
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                  <span className={`text-sm group-hover:text-pink-600 transition-colors ${selectedFilters.subcategory_id.includes(sub.id) ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                    {sub.name}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400">Select a category first</p>
            )}
          </div>
        </div>

        {/* --- 3. Vendors --- */}
        <div>
          <h4 className="font-bold text-sm mb-3 text-slate-800 uppercase tracking-wider">Brand / Designer</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {masterData.vendors.map(vendor => (
              <label key={vendor.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 checked:border-pink-500 checked:bg-pink-500 transition-all"
                    checked={selectedFilters.vendor_id.map(String).includes(String(vendor.id))}
                    onChange={() => handleCheck('vendor_id', vendor.id)}
                  />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                </div>
                <span className={`text-sm group-hover:text-pink-600 transition-colors ${selectedFilters.vendor_id.includes(vendor.id) ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                  {vendor.name}
                </span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}