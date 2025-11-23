import React from 'react';
import { Scissors } from 'lucide-react';

/**
 * Higher-Order Component to display a "Customizable" badge.
 * @param {React.Component} WrappedComponent - The component to wrap (usually an Image).
 */
const withCustomizableBadge = (WrappedComponent) => {
  return ({ is_customizable, ...props }) => {
    // Convert to number/boolean just in case API sends string "1"
    const isCustom = Number(is_customizable) === 1 || is_customizable === true;

    return (
      <div className="relative h-full w-full">
        {isCustom && (
          <div className="absolute top-4 left-4 z-20 animate-in fade-in zoom-in duration-300">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 tracking-wide uppercase border border-indigo-500">
              <Scissors size={12} className="text-indigo-200" /> 
              Customizable
            </span>
          </div>
        )}
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withCustomizableBadge;