import axios from 'axios';

const API_BASE_URL = 'https://social-app-wauj.onrender.com';

// ✅ Fetch all communities
export const fetchCommunities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/communities/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
};

// ✅ Fetch all posts from a community
export const fetchCommunityPosts = async (communityId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/communitiespost/${communityId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
};

// ✅ User Authentication
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// ✅ Fetch User Information
export const fetchUserInfo = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/userinfo/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// ✅ Messages
export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/messages/direct`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const fetchDirectMessages = async (senderId, receiverId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/messages/direct/${senderId}/${receiverId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// ✅ Image Upload
export const uploadImage = async (imageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/images/`, imageData);
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// ✅ Fetch Image
export const fetchImage = async (filename) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/images/${filename}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};
