import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Upload, Trash2, Edit3, Plus, AlertTriangle, CheckCircle, ImageIcon, Loader2, Star
} from "lucide-react";
import api from "../../api/axios"; 
import DataTable from "../../components/ui/DataTable"; 

const VITE_IMGURL = import.meta.env.VITE_IMGURL; 

export default function Designer() {
  // --- Data State ---
  const [vendors, setVendors] = useState([]);
  const [designers, setDesigners] = useState([]);
  
  // --- Table State ---
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // --- Form State ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    designer_id: "",
    designer_name: "",
    designer_title: "",
    designer_rating: ""
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
    fetchDesigners();
  }, []);

  // --- Search Effect ---
  useEffect(() => {
    const delayFn = setTimeout(() => fetchDesigners(1, searchTerm), 500);
    return () => clearTimeout(delayFn);
  }, [searchTerm]);

  // --- API Calls ---
  const fetchMetaData = async () => {
    try {
      const res = await api.get("/designers/meta");
      if (res.data.status) {
        setVendors(res.data.vendors);
      }
    } catch (err) {
      toast.error("Failed to load vendors");
    }
  };

  const fetchDesigners = async (page = 1, search = "") => {
    setTableLoading(true);
    try {
      const res = await api.get(`/designers?page=${page}&search=${search}&per_page=10`);
      if (res.data.status) {
        setDesigners(res.data.data.data);
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
    
    if (name === 'designer_id') {
        // Auto-populate designer_name based on selection
        const selectedVendor = vendors.find(v => String(v.id) === String(value));
        setFormData(prev => ({ 
            ...prev, 
            designer_id: value, 
            designer_name: selectedVendor ? selectedVendor.username : "" 
        }));
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
          // Strict Dimension Check (449x449) as per legacy code
          if (img.width !== 449 || img.height !== 449) {
             setImageError("Dimensions must be exactly 449x449");
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
    data.append('designer_id', formData.designer_id);
    data.append('designer_name', formData.designer_name);
    data.append('designer_title', formData.designer_title);
    data.append('designer_rating', formData.designer_rating);

    if (imageFile) data.append('img_path', imageFile);
    if (editingId) data.append('_method', 'PUT');

    try {
      const url = editingId ? `/designers/${editingId}` : `/designers`;
      const res = await api.post(url, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.status) {
        toast.success(res.data.message);
        
        // --- LOCAL UPDATE ---
        const record = res.data.designer;
        if (editingId) {
           setDesigners(prev => prev.map(item => item.id === editingId ? record : item));
        } else {
           setDesigners(prev => [record, ...prev]);
           setPagination(prev => ({...prev, total: prev.total + 1}));
        }
        // --------------------
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
      const res = await api.delete(`/designers/${deleteId}`);
      if (res.data.status) {
        toast.success("Designer deleted");
        setDesigners(prev => prev.filter(item => item.id !== deleteId));
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
    setFormData({ designer_id: "", designer_name: "", designer_title: "", designer_rating: "" });
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      designer_id: String(item.designer_id),
      designer_name: item.designer_name,
      designer_title: item.designer_title,
      designer_rating: item.designer_rating
    });

    if (item.designer_image) setImagePreview(VITE_IMGURL + item.designer_image);
    else setImagePreview("");

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Table Columns ---
  const columns = [
    { header: "#", className: "w-12", render: (row, idx) => <span className="text-xs text-slate-400">{pagination.from + idx}</span> },
    { header: "Image", render: (row) => row.designer_image ? <img src={VITE_IMGURL + row.designer_image} className="w-12 h-12 rounded object-cover border shadow-sm" /> : <ImageIcon className="text-slate-300"/> },
    { header: "Designer Name", accessor: "designer_name", className: "font-medium text-slate-800" },
    { header: "Title", accessor: "designer_title" },
    { header: "Rating", render: (row) => (
        <div className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star size={14} fill="currentColor" />
            {row.designer_rating}
        </div>
    )},
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Top Designers</h1>
        <p className="text-sm text-slate-500 mt-1">Master &gt; Top Designer</p>
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
                {editingId ? "Edit Designer" : "New Designer"}
              </h2>
              {editingId && <button onClick={resetForm} className="text-xs text-red-600 hover:underline">Cancel</button>}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Designer Name Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designer Name <span className="text-red-500">*</span></label>
                <select name="designer_id" value={formData.designer_id} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="">--Select--</option>
                  {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.username}</option>
                  ))}
                </select>
                {errors.designer_id && <p className="text-red-500 text-xs mt-1">{errors.designer_id[0]}</p>}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designer Image <span className="text-xs text-slate-400">(449x449)</span></label>
                <div className={`border-2 border-dashed rounded-lg p-3 text-center ${imageError ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400'}`}>
                  <input type="file" ref={fileRef} onChange={handleImageChange} className="hidden" id="designer-img" accept="image/*"/>
                  <label htmlFor="designer-img" className="cursor-pointer flex flex-col items-center gap-1">
                     {imagePreview ? <img src={imagePreview} className="w-full h-24 object-contain rounded" /> : <><Upload className="text-slate-400" size={18}/><span className="text-xs text-slate-500">Upload Image</span></>}
                  </label>
                </div>
                {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
                {errors.img_path && <p className="text-red-500 text-xs mt-1">{errors.img_path[0]}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designer Title <span className="text-red-500">*</span></label>
                <input type="text" name="designer_title" value={formData.designer_title} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                {errors.designer_title && <p className="text-red-500 text-xs mt-1">{errors.designer_title[0]}</p>}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Designer Rating <span className="text-red-500">*</span></label>
                <input type="number" name="designer_rating" value={formData.designer_rating} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" step="0.1" />
                {errors.designer_rating && <p className="text-red-500 text-xs mt-1">{errors.designer_rating[0]}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-70 text-sm font-semibold">
                 {loading ? <Loader2 className="animate-spin" size={16}/> : (editingId ? <CheckCircle size={18}/> : <Plus size={18}/>)}
                 {editingId ? "Update Designer" : "Add Designer"}
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
             data={designers}
             loading={tableLoading}
             pagination={pagination}
             searchTerm={searchTerm}
             onSearch={setSearchTerm}
             onPageChange={(page) => fetchDesigners(page, searchTerm)}
             searchPlaceholder="Search by Name or Title..."
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
                  <h3 className="text-lg font-semibold text-slate-800">Remove Designer?</h3>
                  <p className="text-sm text-slate-600">This will remove the designer from the top list.</p>
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