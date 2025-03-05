
const express = require("express");
const router = express.Router();
const { pool } = require("../db/index"); // Ensure the database pool is imported
const { createUser, fetchUsers, updateUser, deleteUser, findUserByUsername, fetchUsernameByUserId } = require("../db/users");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Check if user already exists before registration
const checkUserExists = async (username, email) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("❌ Error checking if user exists:", error);
    throw error;
  }
};

// ✅ Register New User (Matches Frontend API Call)
router.post("/", async (req, res) => {
  try {
    const { username, password, email, dob, bio, location, is_admin, visibility, profile_picture, status } = req.body;

    if (!username || !password || !email || !dob) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    const userExists = await checkUserExists(username, email);
    if (userExists) {
      return res.status(409).json({ error: "User with this username or email already exists." });
    }

    // Create new user
    const newUser = await createUser({
      username,
      password,
      email,
      dob,
      bio,
      location,
      is_admin: is_admin || false,
      visibility: visibility || "public",
      profile_picture: profile_picture || "",
      status: status || "active",
    });

    if (!newUser) {
      return res.status(500).json({ error: "User could not be created" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "User registered successfully", user: newUser, token });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Fetch All Users
router.get("/", async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
