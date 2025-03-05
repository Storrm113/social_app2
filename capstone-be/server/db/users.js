const { pool } = require("./index");
const bcrypt = require("bcrypt");
const uuid = require("uuid");

// **Fetch Users**
const fetchUsers = async () => {
  const query = "SELECT id, username, email FROM users;"; 
  try {
    const { rows } = await pool.query(query); 
    return rows; 
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    throw err;
  }
};

// **Fetch Username by User ID**
const fetchUsernameByUserId = async (userId) => {
  console.log("🔍 Debug - Fetching username for user ID:", userId);
  const query = "SELECT username FROM users WHERE id = $1;";
  try {
    const { rows } = await pool.query(query, [userId]);  
    if (rows.length > 0) {
      return rows[0].username;  
    } else {
      throw new Error("❌ User not found");
    }
  } catch (err) {
    console.error("❌ Error fetching username:", err);
    throw err;
  }
};

// **Create User**
const createUser = async ({
  is_admin = false,
  username,
  password,
  email,
  dob,
  visibility = "public",
  profile_picture = "",
  bio = "",
  location = "",
  status = "active"
}) => {
  console.log("🔍 Debug - Creating user with values:", {
    username, email, dob, is_admin
  });

  try {
    // ✅ Ensure unique constraint on username and email
    const checkSQL = `SELECT id FROM users WHERE username = $1 OR email = $2;`;
    const { rows } = await pool.query(checkSQL, [username, email]);

    if (rows.length > 0) {
      console.log(`⚠️ User with username '${username}' or email '${email}' already exists.`);
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const SQL = `
      INSERT INTO users(id, is_admin, username, password, email, dob, visibility, profile_picture, 
      bio, location, status, created_at)
      VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
      RETURNING *;
    `;

    const result = await pool.query(SQL, [
      is_admin,
      username,
      hashedPassword,
      email,
      dob,
      visibility,
      profile_picture,
      bio,
      location,
      status
    ]);

    if (!result.rows.length) {
      throw new Error("User creation failed");
    }

    return result.rows[0];
  } catch (err) {
    console.error("❌ Error creating user:", err);
    throw err;
  }
};

// **Update User by ID**
const updateUser = async (userId, updateData) => {
  try {
    // ✅ Fetch existing user to preserve `is_admin`
    const existingUserRes = await pool.query(
      `SELECT is_admin FROM users WHERE id = $1`,
      [userId]
    );

    if (existingUserRes.rows.length === 0) {
      return null; // ✅ User not found
    }

    const existingUser = existingUserRes.rows[0];

    // ✅ Preserve `is_admin`
    const {
      username,
      email,
      bio,
      location,
      status,
      profile_picture,
      is_admin = existingUser.is_admin
    } = updateData;

    const SQL = `
      UPDATE users
      SET username = $1, email = $2, bio = $3, location = $4, status = $5, profile_picture = $6, is_admin = $7
      WHERE id = $8
      RETURNING *;
    `;

    const result = await pool.query(SQL, [
      username,
      email,
      bio,
      location,
      status,
      profile_picture,
      is_admin,
      userId
    ]);

    return result.rows[0];
  } catch (err) {
    console.error("❌ Error updating user:", err);
    throw err;
  }
};

// **Delete User**
const deleteUser = async (id) => {
  try {
    const SQL = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const result = await pool.query(SQL, [id]);
    return result.rows[0] || null;
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    throw err;
  }
};

// **Find User by Username**
const findUserByUsername = async (username) => {
  try {
    console.log("🔍 Debug - Finding user by username:", username);

    const SQL = `
      SELECT id, username, email, profile_picture, bio 
      FROM users
      WHERE username = $1;
    `;
    const response = await pool.query(SQL, [username]);

    if (!response.rows.length) {
      throw new Error("❌ User not found");
    }

    return response.rows[0];
  } catch (err) {
    console.error("❌ Error in findUserByUsername:", err);
    throw new Error("User not found");
  }
};

// **Exporting functions**
module.exports = {
  fetchUsers,
  updateUser,
  findUserByUsername,
  createUser,
  deleteUser,
  fetchUsernameByUserId
};
