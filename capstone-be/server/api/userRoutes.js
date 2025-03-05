const express = require("express");
const router = express.Router();
const { createUser, fetchUsers, updateUser, deleteUser, findUserByUsername, fetchUsernameByUserId } = require("../db/users");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Check if user already exists before registration
const checkUserExists = async (username, email) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1 OR email = $2`,
    [username, email]
  );
  return result.rows.length > 0;
};

// ✅ Register New User
router.post("/register", async (req, res) => {
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

    res.status(201).json({ ...newUser, token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Fetch All Users
router.get("/", async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Fetch User Info by Username
router.get("/userinfo/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await findUserByUsername(username);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

// ✅ Update User Info
router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedUser = await updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ ...updatedUser, message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ✅ Delete User
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteUser(userId);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
