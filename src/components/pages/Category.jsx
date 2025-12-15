import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import {
  Upload, Trash2, Edit3, Plus, X,
  AlertTriangle, CheckCircle, ImageIcon, Loader2
} from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from "../../hooks/useCategories";

const VITE_IMGURL = import.meta.env.VITE_IMGURL;

const CATEGORY_TYPES = [
  { value: "1", label: "Mens Wear" },
  { value: "2", label: "Women Wear" },
  { value: "3", label: "Kids Wear" },
  { value: "4", label: "Unisex Wear" },
  { value: "5", label: "Others" },
];

export default function Category() {
  // --- Data State ---
  // Managed by React Query now

  // --- Pagination & Search State ---
  const [queryParams, setQueryParams] = useState({
    page: 1,
    search: ""
  });

  const [searchTerm, setSearchTerm] = useState("");

  // --- Form State ---
  const [categoryType, setCategoryType] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);

  // --- Image State ---
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const fileRef = useRef(null);

  // --- Errors & Modals ---
  const [errors, setErrors] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // --- React Query Hooks ---
  const { data: categoryData, isLoading: tableLoading } = useCategories(queryParams);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const categories = categoryData?.data?.data || [];
  const pagination = {
    current_page: categoryData?.data?.current_page || 1,
    last_page: categoryData?.data?.last_page || 1,
    total: categoryData?.data?.total || 0,
    per_page: categoryData?.data?.per_page || 10,
    from: categoryData?.data?.from || 0,
    to: categoryData?.data?.to || 0
  };

  // --- Form Handlers ---
  const resetForm = () => {
    setCategoryType("");
    setCategoryName("");
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    setErrors({});
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError("");
    setImageFile(null);
    setImagePreview("");

    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setImageError("Format must be JPEG or PNG");
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
        if (img.width !== 720 || img.height !== 851) {
          setImageError("Dimensions must be 720x851 px");
          return;
        }
        setImageFile(file);
        setImagePreview(ev.target.result);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append("category_type", categoryType);
    formData.append("category_name", categoryName);
    if (imageFile) formData.append("img_path", imageFile);

    if (editingId) {
      updateMutation.mutate({ id: editingId, formData }, {
        onSuccess: (data) => {
          if (data.status) resetForm();
          else if (data.errors) setErrors(data.errors);
        },
        onError: (err) => {
          if (err.response?.status === 422) setErrors(err.response.data.errors);
        }
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: (data) => {
          if (data.status) resetForm();
          else if (data.errors) setErrors(data.errors);
        },
        onError: (err) => {
          if (err.response?.status === 422) setErrors(err.response.data.errors);
        }
      });
    }
  };

  const handleEditClick = (cat) => {
    setEditingId(cat.id);
    setCategoryType(String(cat.category_type || cat.type || ""));
    setCategoryName(cat.category_name || cat.name);
    if (cat.img_path) {
      setImagePreview(VITE_IMGURL + cat.img_path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Delete Handlers ---
  const initiateDelete = (id) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;
    deleteMutation.mutate(categoryToDelete, {
      onSettled: () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      }
    });
  };

  const getTypeLabel = (value) => {
    return CATEGORY_TYPES.find((t) => t.value === String(value))?.label || "Unknown";
  };

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  // --- Table Columns Configuration ---
  const columns = [
    {
      header: "#",
      className: "w-16",
      render: (row, index) => (
        <span className="text-slate-400 text-xs">
          {(pagination.from || 1) + index}
        </span>
      )
    },
    {
      header: "Image",
      render: (row) => (
        row.img_path ? (
          <img
            src={VITE_IMGURL + row.img_path}
            alt={row.category_name}
            className="w-10 h-12 object-cover rounded border border-slate-200 shadow-sm"
          />
        ) : (
          <div className="w-10 h-12 bg-slate-100 rounded border flex items-center justify-center text-slate-400">
            <ImageIcon size={16} />
          </div>
        )
      )
    },
    {
      header: "Name",
      render: (row) => (
        <span className="font-medium text-slate-800">{row.category_name || row.name}</span>
      )
    },
    {
      header: "Type",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {getTypeLabel(row.category_type || row.type)}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      tdClassName: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => handleEditClick(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => initiateDelete(row.id)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your product classifications</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Form */}
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
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              {editingId && (
                <button onClick={resetForm} className="text-xs text-red-600 hover:underline font-medium">
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Type <span className="text-red-500">*</span></label>
                <select
                  required
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.category_type ? 'border-red-300' : 'border-slate-300'}`}
                >
                  <option value="">Select Type...</option>
                  {CATEGORY_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
                {errors.category_type && <p className="text-red-500 text-xs mt-1">{errors.category_type[0]}</p>}
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Summer Collection"
                  className={`w-full px-3 py-2 bg-white border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.category_name ? 'border-red-300' : 'border-slate-300'}`}
                />
                {errors.category_name && <p className="text-red-500 text-xs mt-1">{errors.category_name[0]}</p>}
              </div>

              {/* Image Upload */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Cover Image <span className="text-xs text-slate-400 font-normal">(720x851px)</span>
                </label>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative group border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-300 ${imageError ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={handleImageChange}
                    accept="image/png, image/jpeg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <div className="relative mx-auto w-32 h-40 rounded overflow-hidden shadow-sm border border-slate-200">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-xs font-medium">Change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="p-3 bg-slate-100 rounded-full mb-2 group-hover:bg-blue-100 transition-colors duration-300">
                        <Upload size={20} className="text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <p className="text-sm text-slate-600">Click to upload</p>
                    </div>
                  )}
                </motion.div>
                {imageError && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertTriangle size={12} /> {imageError}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isFormLoading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isFormLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <CheckCircle size={18} /> : <Plus size={18} />)}
                  {isFormLoading ? "Processing..." : (editingId ? "Update Category" : "Create Category")}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Reusable Data Table */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="xl:col-span-2"
        >
          <DataTable
            columns={columns}
            data={categories}
            loading={tableLoading}
            pagination={pagination}
            searchTerm={searchTerm}
            onSearch={(term) => {
              setSearchTerm(term);
              setQueryParams(prev => ({ ...prev, page: 1, search: term }));
            }}
            onPageChange={(newPage) => setQueryParams(prev => ({ ...prev, page: newPage }))}
            searchPlaceholder="Search categories..."
          />
        </motion.div>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
            >

              {/* Modal Header */}
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-full text-red-600">
                    <AlertTriangle size={18} />
                  </div>
                  Confirm Deletion
                </h3>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6">
                <p className="text-slate-600 leading-relaxed">
                  Are you sure you want to permanently delete this category? <br />
                  <span className="text-xs text-slate-400">This action cannot be undone.</span>
                </p>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 shadow-md shadow-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  Yes, Delete It
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}