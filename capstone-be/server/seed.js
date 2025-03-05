const { pool } = require("./db");
const { createTables } = require("./db/db.js");
const { createCommunityPost, fetchPostsByCommunity } = require("./db/communityPost.js");
const { createUser, fetchUsers } = require("./db/users.js");
const { createCommunity, fetchCommunities } = require("./db/community.js");

// ✅ Check if user already exists
const checkUserExists = async (username, email) => {
  const result = await pool.query(`SELECT * FROM users WHERE username = $1 OR email = $2`, [username, email]);
  return result.rows.length > 0;
};

// ✅ Check if community already exists
const checkCommunityExists = async (name) => {
  const result = await pool.query(`SELECT * FROM communities WHERE name = $1`, [name]);
  return result.rows.length > 0;
};

const seedDb = async () => {
  try {
    await createTables();
    console.log("Seeding users and communities...");

    // ✅ Check if the user already exists before creating
    const userExists = await checkUserExists("john_doe", "john@example.com");
    let user;
    if (!userExists) {
      user = await createUser({
        username: "john_doe",
        password: "password123",
        email: "john@example.com",
        name: "John Doe",
        dob: "1990-05-15",
        is_admin: true,
      });
      console.log("✅ User 'john_doe' created.");
    } else {
      console.log("⚠️ User 'john_doe' already exists. Skipping.");
      const users = await fetchUsers();
      user = users.find((u) => u.username === "john_doe");
    }

    // ✅ Check if the community already exists before creating
    const communityExists = await checkCommunityExists("Tech Enthusiasts");
    let community;
    if (!communityExists) {
      community = await createCommunity({
        name: "Tech Enthusiasts",
        description: "A community for tech lovers",
        created_by: user.id, // Ensures the user is set as the creator
      });
      console.log("✅ Community 'Tech Enthusiasts' created.");
    } else {
      console.log("⚠️ Community 'Tech Enthusiasts' already exists. Skipping.");
      const communities = await fetchCommunities();
      community = communities.find((c) => c.name === "Tech Enthusiasts");
    }

    if (!user || !community) {
      throw new Error("Failed to retrieve necessary user or community data.");
    }

    console.log("Creating community posts...");
    const post = await createCommunityPost({
      user_id: user.id,
      community_id: community.id,
      title: "Welcome to Tech Enthusiasts!",
      content: "Let's discuss the latest in technology!",
    });

    if (!post) {
      console.error("❌ Error: Failed to create community post");
    } else {
      console.log("✅ New post created successfully", post);
    }

    console.log("Fetching posts by community...");
    if (typeof fetchPostsByCommunity !== 'function') {
      throw new TypeError("fetchPostsByCommunity is not a function");
    }

    const posts = await fetchPostsByCommunity(community.id);
    console.log("Posts:", posts);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

seedDb();
