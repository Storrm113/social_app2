const express = require("express");
const router = express.Router();
const { fetchPostsByCommunity, createCommunityPost, updateCommunityPost, deleteCommunityPost, fetchAllPosts } = require("../db/communityPost");
const isLoggedIn = require("../middleware/isLoggedIn");
const { pool } = require("../db/index");

// ✅ Fetch ALL community posts
router.get("/posts/all", async (req, res) => {
  try {
    const posts = await fetchAllPosts();
    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching community posts:", err.message);
    res.status(500).json({ error: "Failed to fetch community posts" });
  }
});


// ✅ Fetch posts for a specific community
router.get("/:communityId/posts", async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const posts = await fetchPostsByCommunity(communityId);
    res.status(200).json(posts);
  } catch (err) {
    console.error("❌ Error fetching community posts:", err.message);
    res.status(500).json({ error: "Failed to fetch posts for the community" });
  }
});

// ✅ Create a new community post
router.post("/:communityId/posts", isLoggedIn, async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id; // Extract user ID from token
    const { title, content, imgId, imageUrl } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newPost = await createCommunityPost({
      userId,
      communityId,
      title,
      content,
      imgId: imgId ? imgId.toString() : null, 
    });

    return res.status(201).json({ message: "Community post created successfully", newPost });
  } catch (err) {
    console.error("❌ Error creating community post:", err.message);
    res.status(500).json({ error: "Failed to create community post" });
  }
});

// ✅ Update a community post (Requires Authentication)
router.put("/:communityId/posts/:postId", isLoggedIn, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const updatedPost = await updateCommunityPost(postId, content, userId);
    return res.status(200).json(updatedPost);
  } catch (err) {
    console.error("❌ Error updating post:", err.message);
    res.status(403).json({ error: "Unauthorized to update post" });
  }
});

// ✅ Delete a community post
router.delete("/:communityId/posts/:postId", isLoggedIn, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const postCheck = await pool.query("SELECT user_id, community_id FROM posts WHERE id = $1", [postId]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postOwnerId = postCheck.rows[0].user_id;
    const communityId = postCheck.rows[0].community_id;

    const adminCheck = await pool.query(
      "SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2 AND role = 'admin'",
      [communityId, userId]
    );

    if (postOwnerId !== userId && adminCheck.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized to delete post" });
    }

    const deletedPost = await deleteCommunityPost(postId);
    return res.status(200).json({ message: "Post deleted successfully", deletedPost });
  } catch (err) {
    console.error("❌ Error deleting post:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

module.exports = router;
