import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Ruler, Box, AlertCircle, CheckCircle } from "lucide-react"; 
import api from "../../../api/axios";
import SizeGuide from "../../product/SizeGuide";
import withCustomizableBadge from "./WithCustomizableBadge";


const VITE_IMGURL = import.meta.env.VITE_IMGURL;

// --- INTERNAL COMPONENT: IMAGE GALLERY ---
// We define this separately so we can wrap it with the HOC
const ImageGallery = ({ all_images, selectedImage, setSelectedImage, rating }) => {
  return (
    <div className="flex gap-4 h-full">
      {/* Thumbnail Strip */}
      <div className="flex flex-col gap-2">
        {all_images?.map((img, index) => (
          <div 
            key={index}
            className={`w-16 h-20 border rounded cursor-pointer overflow-hidden ${selectedImage === img ? 'border-pink-500 border-2' : 'border-gray-200'}`}
            onMouseEnter={() => setSelectedImage(img)}
          >
            <img src={img} className="w-full h-full object-cover" alt="" />
          </div>
        ))}
      </div>
      
      {/* Main Image */}
      <div className="flex-1 h-[500px] bg-gray-50 overflow-hidden rounded-lg relative border border-gray-100">
         <img src={selectedImage} className="w-full h-full object-contain mix-blend-multiply" alt="Main" />
         {rating && (
            <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1 font-bold shadow text-sm backdrop-blur-sm">
                {rating} <Star size={14} fill="black"/>
            </div>
         )}
      </div>
    </div>
  );
};

// --- WRAP WITH HOC ---
// This creates a new component that includes the "Customizable" badge logic
const CustomizableImageGallery = withCustomizableBadge(ImageGallery);


export default function ProductDetails() {
  const { id } = useParams(); 
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  
  // Updated Price State to include QTY
  const [priceDetails, setPriceDetails] = useState({
    price: 0, 
    oldPrice: 0, 
    qty: 0, 
    outOfStock: false,
    isLoaded: false // To track if a variant is actually selected
  });

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/show/product/${id}`);
        if (res.data.status) {
          const data = res.data.data;
          setProduct(data);
          setSelectedImage(data.all_images[0]); 
          if (data.product_materials?.length > 0) {
            setSelectedMaterial(data.product_materials[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // 2. Dynamic Price Fetching
  useEffect(() => {
    const getPrice = async () => {
      if (selectedSize && selectedMaterial && product) {
        try {
          const res = await api.get(`/get-product-price`, {
            params: {
              product_id: product.id,
              material_id: selectedMaterial.id,
              size: selectedSize
            }
          });

          if (res.data.status) {
            const pData = res.data.data;
            
            // Logic to determine Out of Stock
            // It is out of stock if API says is_out_stock="1" OR qty is 0
            const isOutOfStock = String(pData.is_out_stock) === '1' || Number(pData.qty) <= 0;

            setPriceDetails({
              price: pData.discount_price || pData.actual_price,
              oldPrice: pData.discount_price ? pData.actual_price : null,
              qty: pData.qty, // Store Qty from API
              outOfStock: isOutOfStock,
              isLoaded: true
            });
          }
        } catch (error) {
          console.error("Price fetch failed", error);
        }
      }
    };

    getPrice();
  }, [selectedSize, selectedMaterial, product]);


  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white min-h-screen">
      
      <SizeGuide 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
        productId={product.id}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* --- LEFT: IMAGES (USING HOC) --- */}
        {/* We pass is_customizable prop to trigger the HOC logic */}
        <CustomizableImageGallery 
            is_customizable={product.is_customizable} 
            all_images={product.all_images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            rating={product.rating}
        />

        {/* --- RIGHT: DETAILS --- */}
        <div className="space-y-6">
          
          {/* Header */}
          <div>
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.vendor?.shop_name}</h1>
                  <p className="text-lg text-gray-500">{product.product_name}</p>
               </div>
               <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded border">
                 PREVIEW MODE
               </span>
            </div>
          </div>

          <hr />

          {/* Price & Stock Section */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
            
            {/* Price Display */}
            <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                    ₹{priceDetails.isLoaded ? priceDetails.price : (product.product_materials[0]?.prices[0]?.actual_price)} 
                </span>
                {(priceDetails.oldPrice) && (
                    <span className="text-lg text-gray-400 line-through">₹{priceDetails.oldPrice}</span>
                )}
            </div>

            {/* Stock & Qty Logic */}
            {priceDetails.isLoaded && (
                <div className="flex items-center gap-4 text-sm mt-2">
                    
                    {/* Status Badge */}
                    {priceDetails.outOfStock ? (
                        <div className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 px-3 py-1 rounded border border-red-200">
                            <AlertCircle size={16} />
                            OUT OF STOCK
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-green-700 font-bold bg-green-50 px-3 py-1 rounded border border-green-200">
                            <CheckCircle size={16} />
                            IN STOCK
                        </div>
                    )}

                    {/* Qty Display (Only show if not out of stock) */}
                    {!priceDetails.outOfStock && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <Box size={16} />
                            <span>Available Qty: <span className="text-slate-900 font-bold">{priceDetails.qty}</span></span>
                        </div>
                    )}
                </div>
            )}
            
            {!priceDetails.isLoaded && <p className="text-xs text-gray-400">Select a material and size to view stock.</p>}
          </div>

          {/* Material Selector */}
          <div>
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-500">Select Material</h4>
            <div className="flex gap-3">
                {product.product_materials?.map((mat) => (
                    <div 
                        key={mat.id}
                        onClick={() => setSelectedMaterial(mat)}
                        className={`cursor-pointer border-2 rounded-lg p-1 transition-all ${selectedMaterial?.id === mat.id ? 'border-pink-500 bg-pink-50' : 'border-transparent hover:border-gray-200'}`}
                    >
                        <div className="w-16 h-16 rounded-md overflow-hidden mb-1">
                            <img src={`http://3.7.112.78/bespoke/public${mat.img_path}`} className="w-full h-full object-cover" alt="" />
                        </div>
                        <p className="text-xs text-center font-medium text-gray-700 truncate max-w-[64px]">
                            {mat.master_material?.material_name}
                        </p>
                    </div>
                ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500">Select Size</h4>
                <button 
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-pink-600 text-sm font-semibold flex items-center gap-1 hover:underline hover:text-pink-700"
                >
                    <Ruler size={16} /> Size Guide
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                {product.product_sizes?.map((sizeObj) => (
                    <button
                        key={sizeObj.size} 
                        onClick={() => setSelectedSize(sizeObj.size)}
                        className={`px-4 py-2 rounded-full border font-semibold min-w-[50px] transition-colors
                            ${selectedSize === sizeObj.size 
                                ? 'border-pink-500 text-pink-500 bg-white' 
                                : 'border-gray-300 text-gray-600 hover:border-pink-500'
                            }
                        `}
                    >
                        {sizeObj.size}
                    </button>
                ))}
            </div>
          </div>

          {/* Product Details Table */}
          <div className="pt-6">
             <h4 className="font-bold text-sm mb-3 uppercase text-gray-700">Product Details</h4>
             <p className="text-gray-600 leading-relaxed text-sm mb-6">{product.description}</p>

             <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-200 w-1/3">Attribute</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.product_info?.map((info, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">{info.details_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{info.details_value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}