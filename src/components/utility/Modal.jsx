import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Modal = ({ isOpen, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 150,
            padding: "20px", // important for mobile spacing
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="modal-box"
            style={{
              background: "white",
              width: "100%",
              maxWidth: "500px",       // responsive width
              maxHeight: "90vh",        // responsive height
              overflowY: "auto",        // scroll if content too big
              padding: "20px",
              borderRadius: "10px",
            }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
