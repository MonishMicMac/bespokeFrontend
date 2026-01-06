import api from '../api/axios';

export const getProductDetails = (id) => {
    return api.get(`/vendor/product/edit/${id}`);
};
