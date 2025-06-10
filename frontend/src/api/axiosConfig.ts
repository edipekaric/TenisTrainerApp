import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    // Ensure headers is always an object
    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
