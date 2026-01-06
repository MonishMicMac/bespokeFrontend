import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import api from "../../../api/axios";
import FilterSidebar from "../../ui/FilterSidebar";

export default function ProductFeed() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  // Filter State - Initialize from URL
  const [activeFilters, setActiveFilters] = useState(() => {
    const vendorId = searchParams.get("vendor_id");
    const categoryId = searchParams.get("category_id");
    const subCategoryId = searchParams.get("sub_category_id");

    return {
      category_id: categoryId ? [categoryId] : [],
      vendor_id: vendorId ? [vendorId] : [],
      subcategory_id: subCategoryId ? [subCategoryId] : []
    };
  });

  // Sync URL with activeFilters (UI -> URL)
  useEffect(() => {
    const params = {};
    if (activeFilters.category_id.length) params.category_id = activeFilters.category_id[0];
    if (activeFilters.subcategory_id.length) params.sub_category_id = activeFilters.subcategory_id[0];
    if (activeFilters.vendor_id.length) params.vendor_id = activeFilters.vendor_id[0];

    setSearchParams(params);
  }, [activeFilters]);

  // Sync activeFilters with URL (URL -> UI) - Handles Back/Forward navigation
  useEffect(() => {
    const vendorId = searchParams.get("vendor_id");
    const categoryId = searchParams.get("category_id");
    const subCategoryId = searchParams.get("sub_category_id");

    // Only update if different to avoid loop with above effect
    setActiveFilters(prev => {
      const next = {
        category_id: categoryId ? [categoryId] : [],
        vendor_id: vendorId ? [vendorId] : [],
        subcategory_id: subCategoryId ? [subCategoryId] : []
      };

      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        return next;
      }
      return prev;
    });

  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Construct Query Params
      let query = `?page=${page}&per_page=20`;
      if (activeFilters.category_id.length > 0) query += `&category_id=${activeFilters.category_id[0]}`;
      if (activeFilters.subcategory_id.length > 0) query += `&sub_category_id=${activeFilters.subcategory_id[0]}`; // For simplicity sending one, update backend for array if needed
      if (activeFilters.vendor_id.length > 0) query += `&vendor_id=${activeFilters.vendor_id[0]}`;

      // Artificial Delay for smoothness (min 600ms)
      const [res] = await Promise.all([
        api.get(`/show/products${query}`),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);

      if (res.data.status) {
        setProducts(res.data.data.data);
        setTotalPages(res.data.data.last_page);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, activeFilters]);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <FilterSidebar
        onFilterChange={(filters) => {
          setActiveFilters(filters);
          setPage(1); // Reset to page 1 on filter change
        }}
        initialFilters={activeFilters}
      />

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Fashion Store</h1>
          <p className="text-gray-500 text-sm">Showing results based on your preferences</p>
        </div>

        {/* Loading State - Shimmer Effect */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 animate-pulse">
                {/* Image Skeleton */}
                <div className="w-full h-64 bg-gray-200 rounded-sm"></div>
                {/* Text Skeletons */}
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-700 slide-in-from-bottom-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer flex flex-col gap-2"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image Card */}
                <div className="relative w-full h-64 overflow-hidden rounded-sm bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.product_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Rating Badge */}
                  {product.rating && (
                    <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 text-xs font-bold flex items-center gap-1 rounded shadow-sm">
                      {product.rating} <Star size={10} fill="black" />
                    </div>
                  )}
                  {/* Wishlist Icon (Hidden by default, show on hover) */}
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} className={product.wishlist ? "fill-red-500 text-red-500" : "text-gray-700"} />
                  </button>
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-bold text-gray-800 truncate">{product.vendor_name}</h3>
                  <p className="text-sm text-gray-500 truncate">{product.product_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm">₹{product.discount_price || product.actual_price}</span>
                    {product.discount_price && (
                      <>
                        <span className="text-xs text-gray-400 line-through">₹{product.actual_price}</span>
                        <span className="text-xs text-orange-500">({product.discount_percent}% OFF)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}