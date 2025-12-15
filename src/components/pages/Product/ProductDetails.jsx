import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";
import SizeGuide from "../../product/SizeGuide";




import { ProductModal } from "./ProductModal";
import ImageGallerySection from "./ImageGallerySection";
import ProductInfoSection from "./ProductInfoSection";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const [priceDetails, setPriceDetails] = useState({
    price: 0,
    oldPrice: 0,
    qty: 0,
    outOfStock: false,
    isLoaded: false
  });

  // 1. Load Product
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

  // 2. Dynamic Price Fetch
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

            const isOutOfStock =
              String(pData.is_out_stock) === "1" || Number(pData.qty) <= 0;

            setPriceDetails({
              price: pData.discount_price || pData.actual_price,
              oldPrice: pData.discount_price ? pData.actual_price : null,
              qty: pData.qty,
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

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!product) return <div>Product Not Found</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-white min-h-screen">

      {/* MODAL */}
      {isModalOpen && <ProductModal selectedImage={selectedImage} onClose={() => setModalOpen(false)} />}

      {/* SIZE GUIDE */}
      <SizeGuide
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        productId={product.id}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT SIDE - IMAGES */}
        <ImageGallerySection
          all_images={product.all_images}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          rating={product.rating}
         
          setModalOpen={setModalOpen}
        />

        {/* RIGHT SIDE - INFO */}
        <ProductInfoSection
          product={product}
          priceDetails={priceDetails}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          setIsSizeGuideOpen={setIsSizeGuideOpen}
        />

      </div>
    </div>
  );
}
