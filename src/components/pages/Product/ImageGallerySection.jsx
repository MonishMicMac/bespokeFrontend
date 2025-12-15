import React from "react";
import { Star } from "lucide-react";

export default function ImageGallerySection({
  all_images,
  selectedImage,
  setSelectedImage,
  rating,
  setModalOpen
}) {
  return (
    <div className="flex gap-4 h-full">
      
      {/* Thumbnails */}
      <div className="flex flex-col gap-2">
        {all_images?.map((img, index) => (
          <div
            key={index}
            className={`w-16 h-20 border rounded cursor-pointer overflow-hidden ${
              selectedImage === img
                ? "border-pink-500 border-2"
                : "border-gray-200"
            }`}
            onMouseEnter={() => setSelectedImage(img)}
          >
            <img src={img} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div
        className="flex-1 h-[500px] bg-gray-50 overflow-hidden rounded-lg relative border"
        onClick={() => setModalOpen(true)}
      >
        <img
          src={selectedImage}
          className="w-full h-full object-contain mix-blend-multiply"
        />

        {rating && (
          <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded-full flex items-center gap-1 font-bold shadow text-sm">
            {rating} <Star size={14} fill="black" />
          </div>
        )}
      </div>
    </div>
  );
}
