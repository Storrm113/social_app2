import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://social-app-wauj.onrender.com";

// ✅ Register New User
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error.response?.data || error.message);
    throw error;
  }
};
