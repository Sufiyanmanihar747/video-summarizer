import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

// gemini key AIzaSyA1mBE3clDzxBZstTBzIAxHKbaX4H38Afk