// api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // Change to your backend URL
  // You can add headers or interceptors here
});

export default axiosInstance;