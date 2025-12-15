import React from "react";
import { Scissors } from "lucide-react";

const withCustomizableBadge = (WrappedComponent) => {
  return ({ is_customizable, is_alter, ...props }) => {
    // Normalize values (convert "1", 1, true → boolean true)
    const custom = Number(is_customizable) === 1 || is_customizable === true;
    const alter = Number(is_alter) === 1 || is_alter === true;

    return (
      <div className="relative h-full w-full">

        {/* When BOTH true → show two badges */}
        {custom && alter && (
          <div className="absolute top-4 left-4 z-20 space-y-1 animate-in fade-in zoom-in duration-300">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 tracking-wide uppercase border border-indigo-500">
              <Scissors size={12} className="text-indigo-200" />
              Customizable
            </span>

            <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 tracking-wide uppercase border border-yellow-500">
              <Scissors size={12} className="text-yellow-200" />
              Alter
            </span>
          </div>
        )}

        {/* When only customizable */}
        {custom && !alter && (
          <div className="absolute top-4 left-4 z-20 animate-in fade-in zoom-in duration-300">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 tracking-wide uppercase border border-indigo-500">
              <Scissors size={12} className="text-indigo-200" />
              Customizable
            </span>
          </div>
        )}

        {/* When only alter */}
        {!custom && alter && (
          <div className="absolute top-4 left-4 z-20 animate-in fade-in zoom-in duration-300">
            <span className="bg-yellow-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 tracking-wide uppercase border border-yellow-500">
              <Scissors size={12} className="text-yellow-200" />
              Alter
            </span>
          </div>
        )}

        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withCustomizableBadge;
