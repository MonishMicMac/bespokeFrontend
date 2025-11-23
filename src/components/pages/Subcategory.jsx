import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Upload, Trash2, Edit3, Plus, AlertTriangle, CheckCircle, ImageIcon, Loader2
} from "lucide-react";
import api from "../../api/axios"; 
import DataTable from "../../components/ui/DataTable"; 

const VITE_IMGURL = import.meta.env.VITE_IMGURL; 

const CATEGORY_TYPES = [
  { value: "1", label: "Mens Wear" },
  { value: "2", label: "Women Wear" },
  { value: "3", label: "Kids Wear" },
  { value: "4", label: "Unisex Wear" },
];

export default function SubCategory() {
  // --- Data State ---
  const [allCategories, setAllCategories] = useState([]); 
  
  // --- Table State ---
  const [subCategories, setSubCategories] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // --- Form State ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category_type: "",
    category_id: "",
    name: ""
  });
  const [filteredCategories, setFilteredCategories] = useState([]);

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
    fetchSubCategories();
  }, []);

  // --- Effects: Filter Dropdown ---
  useEffect(() => {
    if (formData.category_type) {
      const filtered = allCategories.filter(c => {
        const catType = c.type || c.category_type; 
        return String(catType) === String(formData.category_type);
      });
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories([]);
    }
  }, [formData.category_type, allCategories]);

  // --- Effects: Search ---
  useEffect(() => {
    const delayFn = setTimeout(() => fetchSubCategories(1, searchTerm), 500);
    return () => clearTimeout(delayFn);
  }, [searchTerm]);

  // --- API Calls ---
  const fetchMetaData = async () => {
    try {
      const res = await api.get("/subcategories/meta");
      if (res.data.status) {
        setAllCategories(res.data.categories);
      }
    } catch (err) {
      toast.error("Failed to load dropdown data");
    }
  };

  const fetchSubCategories = async (page = 1, search = "") => {
    setTableLoading(true);
    try {
      const res = await api.get(`/subcategories?page=${page}&search=${search}&per_page=10`);
      if (res.data.status) {
        setSubCategories(res.data.data.data);
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'category_type') {
        setFormData(prev => ({ ...prev, category_type: value, category_id: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError("");
    setImageFile(null);
    setImagePreview("");
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setImageError("Format must be JPEG or PNG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("File size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        setImageFile(file);
        setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const data = new FormData();
    data.append('category_type', formData.category_type);
    data.append('category_id', formData.category_id);
    data.append('name', formData.name);

    if (imageFile) data.append('img_path', imageFile);
    if (editingId) data.append('_method', 'PUT');

    try {
      const url = editingId ? `/subcategories/${editingId}` : `/subcategories`;
      const res = await api.post(url, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.status) {
        toast.success(res.data.message);

        // --- OPTIMIZED LOCAL UPDATE (No API Refetch) ---
        const returnedRecord = res.data.subcategory || {};
        
        // If the backend didn't return the category relation, look it up locally
        let categoryObj = returnedRecord.category;
        if(!categoryObj) {
            categoryObj = allCategories.find(c => String(c.id) === String(formData.category_id));
        }

        const newTableRecord = {
           ...returnedRecord,
           name: formData.name,
           category_type: formData.category_type,
           category_id: formData.category_id,
           category: categoryObj, 
           img_path: returnedRecord.img_path 
        };

        if (editingId) {
           setSubCategories(prev => prev.map(item => item.id === editingId ? newTableRecord : item));
        } else {
           setSubCategories(prev => [newTableRecord, ...prev]);
           setPagination(prev => ({...prev, total: prev.total + 1}));
        }
        // -----------------------------------------------

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
      const res = await api.delete(`/subcategories/${deleteId}`);
      if (res.data.status) {
        toast.success("Subcategory deleted");
        
        // --- OPTIMIZED LOCAL DELETE ---
        setSubCategories(prev => prev.filter(item => item.id !== deleteId));
        setPagination(prev => ({...prev, total: prev.total - 1}));
        // -----------------------------
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
    setFormData({ category_type: "", category_id: "", name: "" });
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      category_type: String(item.category?.type || item.category_type),
      category_id: String(item.category_id),
      name: item.name
    });
    if (item.img_path) setImagePreview(VITE_IMGURL + item.img_path);
    else setImagePreview("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTypeLabel = (val) => {
    return CATEGORY_TYPES.find(t => t.value === String(val))?.label || "N/A";
  };

  // --- Table Configuration ---
  const columns = [
    { header: "#", className: "w-12", render: (row, idx) => <span className="text-xs text-slate-400">{pagination.from + idx}</span> },
    { header: "Image", render: (row) => row.img_path ? <img src={VITE_IMGURL + row.img_path} className="w-10 h-10 rounded object-cover border" /> : <ImageIcon className="text-slate-300" size={24}/> },
    { header: "Category Type", render: (row) => <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">{getTypeLabel(row.category?.type || row.category_type)}</span> },
    { header: "Category", accessor: "category.name", render: (row) => <span className="text-sm font-medium">{row.category?.name}</span> },
    { header: "Sub Category", accessor: "name", className: "font-semibold text-slate-700" },
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sub Categories</h1>
        <p className="text-sm text-slate-500 mt-1">Master &gt; Sub Category</p>
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
                {editingId ? "Edit Subcategory" : "New Subcategory"}
              </h2>
              {editingId && <button onClick={resetForm} className="text-xs text-red-600 hover:underline">Cancel</button>}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Type <span className="text-red-500">*</span></label>
                <select name="category_type" value={formData.category_type} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="">Select Type...</option>
                  {CATEGORY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.category_type && <p className="text-red-500 text-xs mt-1">{errors.category_type[0]}</p>}
              </div>

              {/* Category (Dependent) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select name="category_id" value={formData.category_id} onChange={handleInputChange} disabled={!formData.category_type} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-slate-100">
                  <option value="">Select Category...</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Formal Shirts" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center ${imageError ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400'}`}>
                  <input type="file" ref={fileRef} onChange={handleImageChange} className="hidden" id="subcat-img" accept="image/*"/>
                  <label htmlFor="subcat-img" className="cursor-pointer flex flex-col items-center gap-2">
                     {imagePreview ? (
                       <img src={imagePreview} className="w-24 h-24 object-contain rounded shadow-sm" />
                     ) : (
                       <>
                        <Upload className="text-slate-400" size={20}/>
                        <span className="text-xs text-slate-500">Click to upload</span>
                       </>
                     )}
                  </label>
                </div>
                {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-70 text-sm font-semibold">
                 {loading ? <Loader2 className="animate-spin" size={16}/> : (editingId ? <CheckCircle size={18}/> : <Plus size={18}/>)}
                 {editingId ? "Update Subcategory" : "Create Subcategory"}
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
             data={subCategories}
             loading={tableLoading}
             pagination={pagination}
             searchTerm={searchTerm}
             onSearch={setSearchTerm}
             onPageChange={(page) => fetchSubCategories(page, searchTerm)}
             searchPlaceholder="Search subcategories..."
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
                  <h3 className="text-lg font-semibold text-slate-800">Confirm Deletion</h3>
                  <p className="text-sm text-slate-600">Are you sure you want to delete this subcategory?</p>
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