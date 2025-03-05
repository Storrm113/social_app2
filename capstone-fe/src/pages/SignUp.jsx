import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    dob: "",
    bio: "",
    location: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle input changes dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null); // Reset error state

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log("API URL:", import.meta.env.VITE_API_BASE_URL); // Debugging the API URL

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        dob: formData.dob,
        bio: formData.bio,
        location: formData.location,
        is_admin: false,
        visibility: "public",
        profile_picture: "",
        status: "active",
      });

      console.log("API Response:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token); // Store token
        setSuccess(true);
        alert("Registration Successful");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error response:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false); // Ensure button resets after submission
    }
  }

  return (
    <div className="signup_main_container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name:
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
        </label>
        <label>Last Name:
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </label>
        <label>Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <label>Username:
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </label>
        <label>Password:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        <label>Confirm Password:
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          {formData.password && formData.confirmPassword && (
            <p className="match-message">{formData.password === formData.confirmPassword ? "Passwords match!" : "Passwords do not match"}</p>
          )}
        </label>
        <label>Date of Birth:
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        </label>
        <label>Bio:
          <textarea name="bio" value={formData.bio} onChange={handleChange} />
        </label>
        <label>Location:
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
        </label>
        <button type="submit" disabled={loading} className="btn">
          {loading ? "Registering..." : "Submit"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">Registration successful! Please login.</p>}
    </div>
  );
}

export default SignUp;
