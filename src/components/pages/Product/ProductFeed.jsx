import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import api from "../../../api/axios";
import FilterSidebar from "../../ui/FilterSidebar";

export default function ProductFeed() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Filter State
  const [activeFilters, setActiveFilters] = useState({
    category_id: [],
    vendor_id: [],
    subcategory_id: []
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Construct Query Params
      let query = `?page=${page}&per_page=20`;
      if (activeFilters.category_id.length > 0) query += `&category_id=${activeFilters.category_id[0]}`;
        if (activeFilters.subcategory_id.length > 0) query += `&sub_category_id=${activeFilters.subcategory_id[0]}`; // For simplicity sending one, update backend for array if needed
      if (activeFilters.vendor_id.length > 0) query += `&vendor_id=${activeFilters.vendor_id[0]}`;

      const res = await api.get(`/show/products${query}`);
      
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
      <FilterSidebar onFilterChange={(filters) => {
        setActiveFilters(filters);
        setPage(1); // Reset to page 1 on filter change
      }} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Fashion Store</h1>
          <p className="text-gray-500 text-sm">Showing results based on your preferences</p>
        </div>

        {/* Loading State */}
        {loading && <div className="text-center py-20">Loading products...</div>}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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