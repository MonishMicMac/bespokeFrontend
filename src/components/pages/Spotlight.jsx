import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
  Upload, Trash2, Edit3, Plus, AlertTriangle, CheckCircle, ImageIcon, Loader2, Store
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import {
  useSpotlights,
  useSpotlightMeta,
  useCreateSpotlight,
  useUpdateSpotlight,
  useDeleteSpotlight
} from "../../hooks/useSpotlights";

const VITE_IMGURL = import.meta.env.VITE_IMGURL;

export default function Spotlight() {
  // --- Pagination & Search State ---
  const [queryParams, setQueryParams] = useState({
    page: 1,
    search: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  // --- React Query Hooks ---
  const { data: spotData, isLoading: tableLoading } = useSpotlights(queryParams);
  const { data: metaData } = useSpotlightMeta();
  const createMutation = useCreateSpotlight();
  const updateMutation = useUpdateSpotlight();
  const deleteMutation = useDeleteSpotlight();

  const spotlights = spotData?.data?.data || [];
  const pagination = {
    current_page: spotData?.data?.current_page || 1,
    last_page: spotData?.data?.last_page || 1,
    total: spotData?.data?.total || 0,
    per_page: spotData?.data?.per_page || 10,
    from: spotData?.data?.from || 0,
    to: spotData?.data?.to || 0
  };

  const vendors = metaData?.vendors || [];

  // --- Form State ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    shop_id: "",
    shop_name: "",
    price: "",
    title: ""
  });

  // --- Image States ---
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState("");
  const [bgError, setBgError] = useState("");
  const bgRef = useRef(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState("");
  const logoRef = useRef(null);

  // --- UI State ---
  const [errors, setErrors] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'shop_id') {
      const selectedVendor = vendors.find(v => String(v.id) === String(value));
      setFormData(prev => ({
        ...prev,
        shop_id: value,
        shop_name: selectedVendor ? selectedVendor.shop_name : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e, setFile, setPreview, setError) => {
    const file = e.target.files[0];
    setError("");
    setFile(null);
    setPreview("");
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg", "image/svg+xml"].includes(file.type)) {
      setError("Invalid format (JPEG, PNG, SVG only)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target.result;
      img.onload = () => {
        setFile(file);
        setPreview(ev.target.result);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const data = new FormData();
    data.append('shop_id', formData.shop_id);
    data.append('shop_name', formData.shop_name);
    data.append('price', formData.price);
    data.append('title', formData.title);

    if (bgFile) data.append('img_path', bgFile);
    if (logoFile) data.append('brand_logo', logoFile);

    const onSuccess = (data) => {
      if (data.status) resetForm();
      else if (data.errors) setErrors(data.errors);
    };
    const onError = (err) => {
      if (err.response?.status === 422) setErrors(err.response.data.errors);
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, formData: data }, { onSuccess, onError });
    } else {
      createMutation.mutate(data, { onSuccess, onError });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSettled: () => {
        setDeleteModalOpen(false);
        setDeleteId(null);
      }
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ shop_id: "", shop_name: "", price: "", title: "" });

    setBgFile(null); setBgPreview(""); setBgError("");
    if (bgRef.current) bgRef.current.value = "";

    setLogoFile(null); setLogoPreview(""); setLogoError("");
    if (logoRef.current) logoRef.current.value = "";

    setErrors({});
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      shop_id: String(item.shop_id),
      shop_name: item.shop_name,
      price: item.price,
      title: item.title
    });

    if (item.background_image) setBgPreview(VITE_IMGURL + item.background_image);
    else setBgPreview("");

    if (item.brand_logo) setLogoPreview(VITE_IMGURL + item.brand_logo);
    else setLogoPreview("");

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  // --- Table Columns ---
  const columns = [
    { header: "#", className: "w-12", render: (row, idx) => <span className="text-xs text-slate-400">{(pagination.from || 1) + idx}</span> },
    { header: "Background", render: (row) => row.background_image ? <img src={VITE_IMGURL + row.background_image} className="w-12 h-12 rounded object-cover border shadow-sm" /> : <ImageIcon className="text-slate-300" /> },
    { header: "Shop Name", accessor: "shop_name", className: "font-medium text-slate-800" },
    { header: "Title", accessor: "title" },
    { header: "Price", render: (row) => <span className="font-semibold text-slate-700">₹{row.price}</span> },
    { header: "Logo", render: (row) => row.brand_logo ? <img src={VITE_IMGURL + row.brand_logo} className="w-10 h-10 rounded-full object-contain border bg-white" /> : <Store className="text-slate-300" /> },
    {
      header: "Actions", className: "text-right", render: (row) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={16} /></button>
          <button onClick={() => { setDeleteId(row.id); setDeleteModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Spotlights</h1>
        <p className="text-sm text-slate-500 mt-1">Master &gt; Shop in Spotlight</p>
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
                {editingId ? <Edit3 size={18} className="text-blue-600" /> : <Plus size={18} className="text-blue-600" />}
                {editingId ? "Edit Spotlight" : "New Spotlight"}
              </h2>
              {editingId && <button onClick={resetForm} className="text-xs text-red-600 hover:underline">Cancel</button>}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Shop Dropdown */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name <span className="text-red-500">*</span></label>
                <select name="shop_id" value={formData.shop_id} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  <option value="">--Select Shop--</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.shop_name}</option>
                  ))}
                </select>
                {errors.shop_id && <p className="text-red-500 text-xs mt-1">{errors.shop_id[0]}</p>}
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

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Background Image <span className="text-xs text-slate-400">(1600x1600)</span></label>
                <div className={`border-2 border-dashed rounded-lg p-3 text-center ${bgError ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400'}`}>
                  <input type="file" ref={bgRef} onChange={(e) => handleFileChange(e, setBgFile, setBgPreview, setBgError)} className="hidden" id="bg-img" accept="image/*" />
                  <label htmlFor="bg-img" className="cursor-pointer flex flex-col items-center gap-1">
                    {bgPreview ? <img src={bgPreview} className="w-full h-24 object-cover rounded" /> : <><Upload className="text-slate-400" size={18} /><span className="text-xs text-slate-500">Upload Background</span></>}
                  </label>
                </div>
                {bgError && <p className="text-red-500 text-xs mt-1">{bgError}</p>}
                {errors.img_path && <p className="text-red-500 text-xs mt-1">{errors.img_path[0]}</p>}
              </div>

              {/* Brand Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Logo <span className="text-xs text-slate-400">(1118x629)</span></label>
                <div className={`border-2 border-dashed rounded-lg p-3 text-center ${logoError ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400'}`}>
                  <input type="file" ref={logoRef} onChange={(e) => handleFileChange(e, setLogoFile, setLogoPreview, setLogoError)} className="hidden" id="logo-img" accept="image/*" />
                  <label htmlFor="logo-img" className="cursor-pointer flex flex-col items-center gap-1">
                    {logoPreview ? <img src={logoPreview} className="w-full h-24 object-contain rounded" /> : <><Upload className="text-slate-400" size={18} /><span className="text-xs text-slate-500">Upload Logo</span></>}
                  </label>
                </div>
                {logoError && <p className="text-red-500 text-xs mt-1">{logoError}</p>}
                {errors.brand_logo && <p className="text-red-500 text-xs mt-1">{errors.brand_logo[0]}</p>}
              </div>

              <button type="submit" disabled={isFormLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-70 text-sm font-semibold">
                {isFormLoading ? <Loader2 className="animate-spin" size={16} /> : (editingId ? <CheckCircle size={18} /> : <Plus size={18} />)}
                {editingId ? "Update Spotlight" : "Create Spotlight"}
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
            data={spotlights}
            loading={tableLoading}
            pagination={pagination}
            searchTerm={searchTerm}
            onSearch={(term) => {
              setSearchTerm(term);
              setQueryParams(prev => ({ ...prev, page: 1, search: term }));
            }}
            onPageChange={(page) => setQueryParams(prev => ({ ...prev, page }))}
            searchPlaceholder="Search by Shop or Title..."
          />
        </motion.div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle size={24} /></div>
                <h3 className="text-lg font-semibold text-slate-800">Remove Spotlight?</h3>
                <p className="text-sm text-slate-600">Are you sure you want to delete this item?</p>
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