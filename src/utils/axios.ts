import axios from 'axios';
import { storage } from '../lib/utils';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5007/api',
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 从 storage 获取 token
    const token = storage.getToken();
    // 如果有 token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', config); // 添加日志检查请求配置
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 