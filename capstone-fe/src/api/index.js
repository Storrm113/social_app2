import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://social-app-wauj.onrender.com";

// ✅ Correct API call
export const fetchCommunityPosts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/communities/communitiespost/all`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching community posts:", error.response?.data || error.message);
    throw error;
  }
};
