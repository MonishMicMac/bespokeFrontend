import React from "react";
import { Ruler, AlertCircle, CheckCircle, Box } from "lucide-react";

export default function ProductInfoSection({
  product,
  priceDetails,
  selectedMaterial,
  setSelectedMaterial,
  selectedSize,
  setSelectedSize,
  setIsSizeGuideOpen
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{product.vendor?.shop_name}</h1>
        <p className="text-lg text-gray-500">{product.product_name}</p>
      </div>

      <hr />

      {/* Price */}
      <div className="bg-gray-50 p-4 border rounded">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">
            ₹{priceDetails.isLoaded ? priceDetails.price : product.product_materials[0]?.prices[0]?.actual_price}
          </span>
          {priceDetails.oldPrice && (
            <span className="line-through text-gray-400 text-lg">₹{priceDetails.oldPrice}</span>
          )}
        </div>

        {/* Stock Info */}
        {priceDetails.isLoaded && (
          <div className="flex items-center gap-4 mt-2 text-sm">
            {priceDetails.outOfStock ? (
              <span className="flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded">
                <AlertCircle size={16} /> OUT OF STOCK
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded">
                <CheckCircle size={16} /> IN STOCK
              </span>
            )}

            {!priceDetails.outOfStock && (
              <span className="flex items-center gap-1 text-gray-700">
                <Box size={16} /> Available Qty: <b>{priceDetails.qty}</b>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Material Selector */}
      <div>
        <h4 className="text-sm font-bold text-gray-500 mb-2">Material</h4>

        <div className="flex gap-3">
          {product.product_materials?.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelectedMaterial(m)}
              className={`cursor-pointer border-2 rounded-lg p-1 ${
                selectedMaterial?.id === m.id
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200"
              }`}
            >
              <div className="w-16 h-16 overflow-hidden rounded">
                <img src={`http://3.7.112.78/bespoke/public${m.img_path}`} />
              </div>
              <p className="text-xs text-center">{m.master_material?.material_name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <div className="flex justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-500">Select Size</h4>
          <button
            className="text-pink-600 font-semibold text-sm"
            onClick={() => setIsSizeGuideOpen(true)}
          >
            <Ruler size={14} /> Size Guide
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          {product.product_sizes?.map((s) => (
            <button
              key={s.size}
              onClick={() => setSelectedSize(s.size)}
              className={`px-4 py-2 rounded-full border font-semibold ${
                selectedSize === s.size ? "border-pink-500 text-pink-500" : "border-gray-300"
              }`}
            >
              {s.size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
