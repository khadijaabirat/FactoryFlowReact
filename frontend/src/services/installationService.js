import api from './api';

const instalationService={
    getStatus:async()=>{
        const response = await api.get('/installation/status');
        return response.data;
    },
    install:async(adminData)=>{
        const response = await api.post('/installation',adminData);
        return response.data;
        },
};
export default instalationService;
