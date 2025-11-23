import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Upload, Trash2, Edit3, Plus, AlertTriangle, CheckCircle, ImageIcon, Loader2, Smartphone
} from "lucide-react";
import api from "../../api/axios"; 
import DataTable from "../../components/ui/DataTable"; 

const VITE_IMGURL = import.meta.env.VITE_IMGURL; 

export default function AppBanner() {
  // --- Data State ---
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  // --- Table State ---
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0
  });

  // --- Form State ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "homepage",
    navigate: "",
    searchfield_id: "",
    searchfield_text: ""
  });

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
    fetchBanners();
  }, []);

  // --- API Calls ---
  const fetchMetaData = async () => {
    try {
      const res = await api.get("/app-banners/meta");
      if (res.data.status) {
        setProducts(res.data.products);
        setVendors(res.data.vendors);
      }
    } catch (err) {
      toast.error("Failed to load dropdown data");
    }
  };

  const fetchBanners = async (page = 1) => {
    setTableLoading(true);
    try {
      const res = await api.get(`/app-banners?page=${page}&per_page=10`);
      if (res.data.status) {
        setBanners(res.data.data.data);
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
    
    if (name === 'navigate') {
        // Reset dependent fields when navigation type changes
        setFormData(prev => ({ ...prev, navigate: value, searchfield_id: "", searchfield_text: "" }));
    } else if (name === 'searchfield_id') {
        // Auto-populate the Text Name based on ID selection
        const selectedList = formData.navigate === '1' ? products : vendors;
        // Find item (Product uses product_name, Vendor uses shop_name)
        const selectedItem = selectedList.find(item => String(item.id) === String(value));
        const text = selectedItem ? (selectedItem.product_name || selectedItem.shop_name) : "";
        
        setFormData(prev => ({ ...prev, searchfield_id: value, searchfield_text: text }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError("");
    setImageFile(null);
    setImagePreview("");
    if (!file) return;

    // Size validation (5MB) matches your PHP rule
    if (file.size > 5 * 1024 * 1024) {
      setImageError("File size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
       const img = new Image();
       img.src = ev.target.result;
       img.onload = () => {
          // Dimension Check (960x576)
          if (img.width !== 960 || img.height !== 576) {
             setImageError("Dimensions must be exactly 960x576");
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

    // Limit check on frontend (Optional, backend does it too)
    if (!editingId && banners.length >= 5) {
        toast.error("Limit Reached: You can only upload 5 active banners.");
        setLoading(false);
        return;
    }

    const data = new FormData();
    data.append('type', formData.type);
    data.append('navigate', formData.navigate);
    data.append('searchfield_id', formData.searchfield_id);
    data.append('searchfield_text', formData.searchfield_text);

    if (imageFile) data.append('img_path', imageFile);
    if (editingId) data.append('_method', 'PUT');

    try {
      const url = editingId ? `/app-banners/${editingId}` : `/app-banners`;
      const res = await api.post(url, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.status) {
        toast.success(res.data.message);

        // --- OPTIMIZED LOCAL UPDATE ---
        const returnedRecord = res.data.banner;

        if (editingId) {
           setBanners(prev => prev.map(item => item.id === editingId ? returnedRecord : item));
        } else {
           setBanners(prev => [returnedRecord, ...prev]);
           setPagination(prev => ({...prev, total: prev.total + 1}));
        }
        // -----------------------------

        resetForm();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else if (err.response?.status === 403) {
        // Handle Limit Reached Error
        toast.error(err.response.data.message);
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
      const res = await api.delete(`/app-banners/${deleteId}`);
      if (res.data.status) {
        toast.success("Banner removed");
        // --- LOCAL DELETE ---
        setBanners(prev => prev.filter(item => item.id !== deleteId));
        setPagination(prev => ({...prev, total: prev.total - 1}));
      }
    } catch (error) {
      toast.error("Failed to remove banner");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ type: "homepage", navigate: "", searchfield_id: "", searchfield_text: "" });
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      type: item.type,
      navigate: String(item.navigate),
      searchfield_id: String(item.searchfield_id),
      searchfield_text: item.searchfield_text
    });
    if (item.img_path) setImagePreview(VITE_IMGURL + item.img_path);
    else setImagePreview("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Helpers ---
  const getNavigateLabel = (val) => val === '1' ? "Product" : (val === '2' ? "Shop/Designer" : "N/A");
  const getTypeLabel = (val) => val.charAt(0).toUpperCase() + val.slice(1);

  // --- Dynamic Options for Search Field ---
  const searchFieldOptions = formData.navigate === '1' ? products : (formData.navigate === '2' ? vendors : []);

  // --- Table Columns ---
  const columns = [
    { header: "#", className: "w-12", render: (row, idx) => <span className="text-xs text-slate-400">{pagination.from + idx}</span> },
    { header: "Image", render: (row) => row.img_path ? <img src={VITE_IMGURL + row.img_path} className="w-24 h-14 rounded object-cover border shadow-sm" /> : <ImageIcon className="text-slate-300" size={24}/> },
    { header: "Type", render: (row) => <span className="text-sm font-medium text-slate-700">{getTypeLabel(row.type)}</span> },
    { header: "Navigate To", render: (row) => <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">{getNavigateLabel(String(row.navigate))}</span> },
    { header: "Search Field", accessor: "searchfield_text", className: "text-sm text-slate-600" },
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">App Banners</h1>
        <p className="text-sm text-slate-500 mt-1">Master &gt; App Banner</p>
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
                {editingId ? "Edit Banner" : "New Banner"}
              </h2>
              {editingId && <button onClick={resetForm} className="text-xs text-red-600 hover:underline">Cancel</button>}
            </div>
            
            {/* Limit Warning */}
            {!editingId && banners.length >= 5 && (
                <div className="mx-5 mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md flex items-center gap-2 text-orange-700 text-sm">
                    <AlertTriangle size={16} />
                    <span>Limit reached (5/5). Delete a banner to add more.</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image <span className="text-xs text-slate-400">(960x576)</span> <span className="text-red-500">*</span></label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${imageError ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400'}`}>
                  <input type="file" ref={fileRef} onChange={handleImageChange} className="hidden" id="banner-img" accept="image/*"/>
                  <label htmlFor="banner-img" className="cursor-pointer flex flex-col items-center gap-2">
                     {imagePreview ? (
                       <img src={imagePreview} className="w-full h-32 object-contain rounded shadow-sm" />
                     ) : (
                       <>
                        <Upload className="text-slate-400" size={20}/>
                        <span className="text-xs text-slate-500">Click to upload</span>
                       </>
                     )}
                  </label>
                </div>
                {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
                {errors.img_path && <p className="text-red-500 text-xs mt-1">{errors.img_path[0]}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banner Type <span className="text-red-500">*</span></label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="homepage">Home Page</option>
                  <option value="promo">Promo</option>
                  <option value="advertisement">Advertisement</option>
                </select>
              </div>

              {/* Navigate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Navigate To <span className="text-red-500">*</span></label>
                <select name="navigate" value={formData.navigate} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="">--Select--</option>
                  <option value="1">Navigate to Product</option>
                  <option value="2">Navigate to Shop or Designer</option>
                </select>
                {errors.navigate && <p className="text-red-500 text-xs mt-1">{errors.navigate[0]}</p>}
              </div>

              {/* Dynamic Search Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Target <span className="text-red-500">*</span></label>
                <select 
                    name="searchfield_id" 
                    value={formData.searchfield_id} 
                    onChange={handleInputChange} 
                    disabled={!formData.navigate}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-slate-100"
                >
                  <option value="">--Select--</option>
                  {searchFieldOptions.map(item => (
                      <option key={item.id} value={item.id}>
                          {/* Checks product_name OR shop_name based on type */}
                          {item.product_name || item.shop_name}
                      </option>
                  ))}
                </select>
                {errors.searchfield_id && <p className="text-red-500 text-xs mt-1">{errors.searchfield_id[0]}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading || (!editingId && banners.length >= 5)} 
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-70 text-sm font-semibold disabled:cursor-not-allowed"
              >
                 {loading ? <Loader2 className="animate-spin" size={16}/> : (editingId ? <CheckCircle size={18}/> : <Plus size={18}/>)}
                 {editingId ? "Update Banner" : "Create Banner"}
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
             data={banners}
             loading={tableLoading}
             pagination={pagination}
             // Banners usually don't need backend search, passing dummy handlers
             searchTerm=""
             onSearch={() => {}}
             onPageChange={(page) => fetchBanners(page)}
             searchPlaceholder="Search not available"
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
                  <h3 className="text-lg font-semibold text-slate-800">Remove Banner?</h3>
                  <p className="text-sm text-slate-600">This will remove the banner from the app.</p>
                  <div className="flex gap-3 w-full mt-2">
                    <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-2 border rounded-md text-slate-700 hover:bg-slate-50">Cancel</button>
                    <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Remove</button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}