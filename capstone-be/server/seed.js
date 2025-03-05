const { pool } = require("./db");
const { createTables } = require("./db/db.js");
const { createCommunityPost, fetchPostsByCommunity } = require("./db/communityPost.js");
const { createUser, fetchUsers } = require("./db/users.js");
const { createCommunity, fetchCommunities } = require("./db/community.js");
const { createPersonalPostComment } = require("./db/personalPostComments.js");
const { saveImage, fetchAllImages } = require("./db/img.js");
const { createPersonalPost } = require("./db/personalPost.js");

const seedDb = async () => {
  try {
    await createTables();
    console.log("Seeding users and communities...");

    await Promise.all([
      createUser({
        username: "john_doe",
        password: "password123",
        email: "john@example.com",
        name: "John Doe",
        dob: "1990-05-15",
      }),
      createCommunity({
        name: "Tech Enthusiasts",
        description: "A community for tech lovers",
      }),
    ]);

    const users = await fetchUsers();
    const communities = await fetchCommunities();

    if (users.length === 0 || communities.length === 0) {
      throw new Error("Failed to seed users or communities");
    }

    const user_id = users[0].id;
    const community_id = communities[0].id;

    console.log("Creating community posts...");
    const post = await createCommunityPost({
      user_id,
      community_id,
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
    const posts = await fetchPostsByCommunity(community_id);
    console.log("Posts:", posts);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

seedDb();
