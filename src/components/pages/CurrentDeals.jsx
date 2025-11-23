import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Trash2, Edit3, Plus, AlertTriangle, CheckCircle, Loader2, Tag, ShoppingBag
} from "lucide-react";
import api from "../../api/axios"; 
import DataTable from "../../components/ui/DataTable"; 

export default function CurrentDeals() {
  // --- Data State ---
  const [vendors, setVendors] = useState([]); // All vendors
  const [products, setProducts] = useState([]); // All products
  const [deals, setDeals] = useState([]); // Table data
  
  // --- Table State ---
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1, last_page: 1, total: 0, per_page: 10, from: 0, to: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  // --- Form State ---
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "", // 'Designer' or 'Shop'
    name: "", // Selected Vendor Name
    vendor_id: "", // Hidden ID to filter products
    product_id: ""
  });

  // --- Derived State (Filtered Lists) ---
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

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
      // 1 = Shop, 2 = Designer (Based on your legacy blade logic)
      const targetType = formData.type === 'Designer' ? 2 : 1;
      
      const filtered = vendors.filter(v => Number(v.vendor_type) === targetType);
      setFilteredVendors(filtered);
    } else {
      setFilteredVendors([]);
    }
  }, [formData.type, vendors]);

  // --- Filter Logic 2: Vendor -> Products ---
  useEffect(() => {
    if (formData.vendor_id) {
      // Show products belonging to this vendor ID
      const filtered = products.filter(p => String(p.vendor_id) === String(formData.vendor_id));
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [formData.vendor_id, products]);


  // --- API Calls ---
  const fetchMetaData = async () => {
    try {
      const res = await api.get("/current-deals/meta");
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
      const res = await api.get(`/current-deals?page=${page}&search=${search}&per_page=10`);
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
        // Reset dependent fields
        setFormData(prev => ({ ...prev, type: value, name: "", vendor_id: "", product_id: "" }));
    } 
    else if (name === 'name') {
        // Value is the vendor_id (we use ID in value attribute for cleaner lookup)
        const selectedVendorId = value; 
        const vendorObj = vendors.find(v => String(v.id) === String(selectedVendorId));
        
        if (vendorObj) {
            // Set display name and ID
            const displayName = vendorObj.vendor_type === 2 ? vendorObj.username : vendorObj.shop_name;
            setFormData(prev => ({ 
                ...prev, 
                vendor_id: selectedVendorId, 
                name: displayName, // We store the Name string in DB as per legacy
                product_id: "" // Reset product
            }));
        }
    } 
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const payload = {
        type: formData.type,
        name: formData.name,
        product_id: formData.product_id
    };

    try {
      const url = editingId ? `/current-deals/${editingId}` : `/current-deals`;
      const method = editingId ? 'put' : 'post';
      
      const res = await api[method](url, payload);

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
      const res = await api.delete(`/current-deals/${deleteId}`);
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
    setFormData({ type: "", name: "", vendor_id: "", product_id: "" });
    setErrors({});
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    
    // Reverse lookup to find vendor_id based on the stored 'name' string
    // This is needed to populate the Product dropdown correctly during edit
    const matchedVendor = vendors.find(v => 
        (v.vendor_type === 2 && v.username === item.name) || 
        (v.vendor_type === 1 && v.shop_name === item.name)
    );

    setFormData({
      type: item.type,
      name: item.name,
      vendor_id: matchedVendor ? matchedVendor.id : "", // Recover ID for filtering
      product_id: String(item.product_id)
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Helpers ---
  const getProductName = (id) => {
      const prod = products.find(p => String(p.id) === String(id));
      return prod ? prod.product_name : "N/A";
  };

  // --- Table Columns ---
  const columns = [
    { header: "#", className: "w-12", render: (row, idx) => <span className="text-xs text-slate-400">{pagination.from + idx}</span> },
    { header: "Type", render: (row) => <span className={`text-xs font-medium px-2 py-1 rounded ${row.type === 'Designer' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>{row.type}</span> },
    { header: "Name", accessor: "name", className: "font-medium text-slate-800" },
    { header: "Product", render: (row) => (
        <div className="flex items-center gap-2 text-slate-600">
            <ShoppingBag size={14} />
            {getProductName(row.product_id)}
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Current Deals</h1>
        <p className="text-sm text-slate-500 mt-1">Master &gt; Top Current Deals</p>
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

              {/* Name Select (Filtered by Type) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                <select 
                    name="name" 
                    // We use vendor_id as the value here to make finding the object easier, 
                    // logic inside handleInputChange sets the actual name string
                    value={formData.vendor_id} 
                    onChange={handleInputChange} 
                    disabled={!formData.type}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-slate-100"
                >
                  <option value="">Select...</option>
                  {filteredVendors.map(v => (
                      <option key={v.id} value={v.id}>
                          {v.vendor_type === 2 ? v.username : v.shop_name}
                      </option>
                  ))}
                </select>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              {/* Product Select (Filtered by Vendor ID) */}
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
             searchPlaceholder="Search by Name or Type..."
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
                  <p className="text-sm text-slate-600">This will remove this deal from the top list.</p>
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