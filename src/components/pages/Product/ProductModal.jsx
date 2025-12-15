import React, { useState, useEffect } from "react";
import Modal from "../../utility/Modal";
import { div } from "framer-motion/client";

export const ProductModal = ({ selectedImage, onClose }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true); // Trigger animation on open
    }, []);

    const handleClose = () => {
        setShow(false); // Start close animation
        setTimeout(onClose, 300); // Wait for animation to finish
    };

    return (

        <div onClick={()=>{handleClose()}}>

         
          <Modal isOpen={show}>
              <img src={selectedImage} alt="" />
            </Modal>  
        </div>



    );
};
