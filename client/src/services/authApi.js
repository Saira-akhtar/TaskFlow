import api from './api';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData); 
    return response.data; 
  } catch (error) {
    throw error.response?.data || { message: 'Server error, please try again' };
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error, please try again' };
  }
};