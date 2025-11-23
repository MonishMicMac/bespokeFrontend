import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Upload, Trash2, Edit3, Plus, AlertTriangle, CheckCircle, ImageIcon, Loader2, ShoppingBag
} from "lucide-react";
import api from "../../api/axios"; 
import DataTable from "../../components/ui/DataTable"; 

const VITE_IMGURL = import.meta.env.VITE_IMGURL; 

export default function SuperSaveDeals() {
  // --- Data State ---
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  
  // --- Table State ---
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // --- Form State ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "", 
    name: "", 
    vendor_id: "", // Hidden field to help filtering
    product_id: "",
    title: "",
    price: ""
  });

  // --- Filtered Lists ---
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // --- Image State ---
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const fileRef = useRef(null);

  // --- UI State ---
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- Initial Load ---
  useEffect(() => {
    fetchMetaData();
    fetchDeals();
  }, []);

  // --- Search Effect ---
  useEffect(() => {
    const delayFn = setTimeout(() => fetchDeals(1, searchTerm), 500);
    return () => clearTimeout(delayFn);
  }, [searchTerm]);

  // --- Filter Logic 1: Type -> Vendors ---
  useEffect(() => {
    if (formData.type) {
      const targetType = formData.type === 'Designer' ? 2 : 1;
      // Use Number() to handle string '1' or '2' from API
      const filtered = vendors.filter(v => Number(v.vendor_type) === targetType);
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors([]);
    }
  }, [formData.type, vendors]);

  // --- Filter Logic 2: Vendor -> Products ---
  useEffect(() => {
    if (formData.vendor_id) {
      const filtered = products.filter(p => String(p.vendor_id) === String(formData.vendor_id));
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [formData.vendor_id, products]);

  // --- API Calls ---
  const fetchMetaData = async () => {
    try {
      const res = await api.get("/supersaver-deals/meta");
      if (res.data.status) {
        setVendors(res.data.vendors);
        setProducts(res.data.products);
      }
    } catch (err) {
      toast.error("Failed to load dropdown data");
    }
  };

  const fetchDeals = async (page = 1, search = "") => {
    setTableLoading(true);
    try {
      const res = await api.get(`/supersaver-deals?page=${page}&search=${search}&per_page=10`);
      if (res.data.status) {
        setDeals(res.data.data.data);
        setPagination({
          current_page: res.data.data.current_page,
          last_page: res.data.data.last_page,
          total: res.data.data.total,
          per_page: res.data.data.per_page,
          from: res.data.data.from,
          to: res.data.data.to
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
        setFormData(prev => ({ ...prev, type: value, name: "", vendor_id: "", product_id: "" }));
    } 
    else if (name === 'name') {
        const selectedVendorId = value; 
        const vendorObj = vendors.find(v => String(v.id) === String(selectedVendorId));
        
        if (vendorObj) {
            // FIX: Robust check for vendor_type
            const isDesigner = Number(vendorObj.vendor_type) === 2;
            const displayName = isDesigner ? vendorObj.username : vendorObj.shop_name;
            
            setFormData(prev => ({ 
                ...prev, 
                vendor_id: selectedVendorId, 
                name: displayName, 
                product_id: "" 
            }));
        }
    } 
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError("");
    setImageFile(null);
    setImagePreview("");
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/svg+xml"].includes(file.type)) {
      setImageError("Format must be JPEG, PNG or SVG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("File size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
       const img = new Image();
       img.src = ev.target.result;
       img.onload = () => {
          if (img.width !== 1118 || img.height !== 629) {
             setImageError("Dimensions must be exactly 1118x629");
             return;
          }
          setImageFile(file);
          setImagePreview(ev.target.result);
       };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const data = new FormData();
    data.append('type', formData.type);
    data.append('name', formData.name);
    data.append('product_id', formData.product_id);
    data.append('title', formData.title);
    data.append('price', formData.price);

    if (imageFile) data.append('brand_logo', imageFile);
    if (editingId) data.append('_method', 'PUT');

    try {
      const url = editingId ? `/supersaver-deals/${editingId}` : `/supersaver-deals`;
      const res = await api.post(url, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.status) {
        toast.success(res.data.message);
        
        // --- LOCAL UPDATE ---
        const record = res.data.deal;
        if (editingId) {
           setDeals(prev => prev.map(item => item.id === editingId ? record : item));
        } else {
           setDeals(prev => [record, ...prev]);
           setPagination(prev => ({...prev, total: prev.total + 1}));
        }
        resetForm();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/supersaver-deals/${deleteId}`);
      if (res.data.status) {
        toast.success("Deal deleted");
        setDeals(prev => prev.filter(item => item.id !== deleteId));
        setPagination(prev => ({...prev, total: prev.total - 1}));
      }
    } catch (error) {
      toast.error("Failed to delete");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ type: "", name: "", vendor_id: "", product_id: "", title: "", price: "" });
    setImageFile(null); setImagePreview(""); setImageError("");
    if (fileRef.current) fileRef.current.value = "";
    setErrors({});
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    
    // FIX: Reverse lookup logic to find the Vendor ID correctly
    const matchedVendor = vendors.find(v => 
        (Number(v.vendor_type) === 2 && v.username === item.name) || 
        (Number(v.vendor_type) === 1 && v.shop_name === item.name)
    );

    setFormData({
      type: item.type,
      name: item.name,
      vendor_id: matchedVendor ? matchedVendor.id : "",
      product_id: String(item.product_id),
      title: item.title,
      price: item.price
    });

    if (item.brand_logo) setImagePreview(VITE_IMGURL + item.brand_logo);
    else setImagePreview("");

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProductName = (id) => {
      const prod = products.find(p => String(p.id) === String(id));
      return prod ? prod.product_name : "N/A";
  };

  // --- Table Columns ---
  const columns = [
    { header: "#", className: "w-12", render: (row, idx) => <span className="text-xs text-slate-400">{pagination.from + idx}</span> },
    { header: "Logo", render: (row) => row.brand_logo ? <img src={VITE_IMGURL + row.brand_logo} className="w-12 h-12 object-contain border rounded bg-white" /> : <ImageIcon className="text-slate-300"/> },
    { header: "Type", render: (row) => <span className={`text-xs font-medium px-2 py-1 rounded ${row.type === 'Designer' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{row.type}</span> },
    { header: "Name", accessor: "name", className: "font-medium text-slate-800" },
    { header: "Product", render: (row) => <div className="flex items-center gap-1 text-sm text-slate-600"><ShoppingBag size={14}/> {getProductName(row.product_id)}</div> },
    { header: "Title", accessor: "title" },
    { header: "Price", render: (row) => <span className="font-bold text-slate-700">₹{row.price}</span> },
    { header: "Actions", className: "text-right", render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={16}/></button>
          <button onClick={() => { setDeleteId(row.id); setDeleteModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
        </div>
      ) 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Super Saver Deals</h1>
        <p className="text-sm text-slate-500 mt-1">Master &gt; Super Saver Deals</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT: Form */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5 }}
           className="xl:col-span-1 h-fit"
        >
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm sticky top-6">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-lg flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                {editingId ? <Edit3 size={18} className="text-blue-600"/> : <Plus size={18} className="text-blue-600"/>}
                {editingId ? "Edit Deal" : "New Deal"}
              </h2>
              {editingId && <button onClick={resetForm} className="text-xs text-red-600 hover:underline">Cancel</button>}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Type Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Type <span className="text-red-500">*</span></label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="">Select...</option>
                  <option value="Designer">Designer</option>
                  <option value="Shop">Shop</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type[0]}</p>}
              </div>

              {/* Name Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                <select 
                    name="name" 
                    value={formData.vendor_id} 
                    onChange={handleInputChange} 
                    disabled={!formData.type}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-slate-100"
                >
                  <option value="">Select...</option>
                  {filteredVendors.map(v => (
                      <option key={v.id} value={v.id}>
                          {/* FIX: Robust check for numeric 2 */}
                          {Number(v.vendor_type) === 2 ? v.username : v.shop_name}
                      </option>
                  ))}
                </select>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              {/* Product Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product <span className="text-red-500">*</span></label>
                <select 
                    name="product_id" 
                    value={formData.product_id} 
                    onChange={handleInputChange}
                    disabled={!formData.vendor_id} 
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-slate-100"
                >
                  <option value="">Select...</option>
                  {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => (
                          <option key={p.id} value={p.id}>{p.product_name}</option>
                      ))
                  ) : (
                      <option value="" disabled>No products available</option>
                  )}
                </select>
                {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id[0]}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price <span className="text-red-500">*</span></label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price[0]}</p>}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Logo <span className="text-xs text-slate-400">(1118x629)</span></label>
                <div className={`border-2 border-dashed rounded-lg p-3 text-center ${imageError ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400'}`}>
                  <input type="file" ref={fileRef} onChange={handleImageChange} className="hidden" id="deal-img" accept="image/*"/>
                  <label htmlFor="deal-img" className="cursor-pointer flex flex-col items-center gap-1">
                     {imagePreview ? <img src={imagePreview} className="w-full h-24 object-contain rounded" /> : <><Upload className="text-slate-400" size={18}/><span className="text-xs text-slate-500">Upload Logo</span></>}
                  </label>
                </div>
                {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
                {errors.brand_logo && <p className="text-red-500 text-xs mt-1">{errors.brand_logo[0]}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-70 text-sm font-semibold">
                 {loading ? <Loader2 className="animate-spin" size={16}/> : (editingId ? <CheckCircle size={18}/> : <Plus size={18}/>)}
                 {editingId ? "Update Deal" : "Add Deal"}
              </button>
            </form>
          </div>
        </motion.div>

        {/* RIGHT: Table */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="xl:col-span-2"
        >
           <DataTable 
             columns={columns}
             data={deals}
             loading={tableLoading}
             pagination={pagination}
             searchTerm={searchTerm}
             onSearch={setSearchTerm}
             onPageChange={(page) => fetchDeals(page, searchTerm)}
             searchPlaceholder="Search by Title or Name..."
           />
        </motion.div>

      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
               <div className="flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle size={24}/></div>
                  <h3 className="text-lg font-semibold text-slate-800">Remove Deal?</h3>
                  <p className="text-sm text-slate-600">This will remove the Super Saver deal from the app.</p>
                  <div className="flex gap-3 w-full mt-2">
                    <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2 border rounded-md text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}