// api/userApi.js
import axiosInstance from './axiosInstance';

export const fetchUser = async (id) => {
  const res = await axiosInstance.get(`/users/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axiosInstance.put(`/users/${id}`, data);
  return res.data;
};

// Add more user-related API functions here