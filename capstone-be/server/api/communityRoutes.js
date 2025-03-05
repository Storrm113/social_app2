const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); // Import JWT to verify user
const isLoggedIn = require("../middleware/isLoggedIn");
const isCommunityAdmin = require("../middleware/isCommunityAdmin");
const { pool } = require("../db/index");
const {
  fetchCommunities,
  getCommunityById,
  fetchCommunityMembers,
  createCommunity,
  updateCommunity,
  addUserToCommunity,
  fetchUserCommunities,
  deleteCommunity,
} = require("../db/community");

// ✅ Fetch all communities
router.get("/", async (req, res) => {
  try {
    const communities = await fetchCommunities();
    res.json(communities);
  } catch (err) {
    console.error("❌ Error fetching communities:", err.message);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});


// Get community details by communityId
router.get("/:communityId", async (req, res) => {
  const { communityId } = req.params;
  try {
    const community = await getCommunityById(communityId);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }
    res.status(200).json(community);
  } catch (err) {
    console.error("Error fetching community:", err.message);
    res.status(500).json({ error: "Failed to fetch community" });
  }
});

// **Add user to a community**
router.post("/:communityId/users/:userId", async (req, res, next) => {
  const { communityId, userId } = req.params;
  const { role } = req.body;
  try {
    const addedUser = await addUserToCommunity(communityId, userId, role || "member");
    res.status(201).json({ message: "User added to community", addedUser });
  } catch (err) {
    console.error("❌ Error adding user to community:", err);
    next(err);
  }
});

// **Get community members**
router.get("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Community ID is required" });
    const members = await fetchCommunityMembers(id);
    res.json(members);
  } catch (err) {
    console.error("Error fetching community members:", err.message);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// **Create a new community**
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user.id;

    if (!name || !description) {
      return res.status(400).json({ error: "Community name and description are required" });
    }

    const newCommunity = await createCommunity({ name, description, createdBy });
    res.status(201).json({ ...newCommunity, message: "Community created successfully" });
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(400).json({ error: err.message });
    }
    console.error("❌ Error creating community:", err);
    res.status(500).json({ error: "Failed to create community" });
  }
});

// **Update a community (Only Admins)**
router.put("/:communityId", isLoggedIn, isCommunityAdmin, async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const updateData = req.body;
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Update data is required" });
    }
    const updatedCommunity = await updateCommunity(communityId, updateData);
    if (!updatedCommunity) {
      return res.status(404).json({ error: "Community not found" });
    }
    res.status(200).json(updatedCommunity);
  } catch (err) {
    console.error("Error updating community:", err);
    next(err);
  }
});

// **Delete a community (Only Admins)**
router.delete("/:communityId", isLoggedIn, isCommunityAdmin, async (req, res) => {
  try {
    const { communityId } = req.params;
    const deletedCommunity = await deleteCommunity(communityId);
    if (!deletedCommunity) return res.status(404).json({ error: "Community not found" });
    res.status(200).json({ message: "Community deleted successfully", deletedCommunity });
  } catch (err) {
    console.error("Error deleting community:", err);
    res.status(500).json({ error: "Failed to delete community" });
  }
});

// **Leave a community**
router.delete("/:communityId/members/:userId", isLoggedIn, async (req, res, next) => {
  try {
    const { communityId, userId } = req.params;
    const result = await pool.query(
      "DELETE FROM community_members WHERE community_id = $1 AND user_id = $2 RETURNING *",
      [communityId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Membership not found" });
    }
    res.status(200).json({ message: "Left the community", membership: result.rows[0] });
  } catch (err) {
    console.error("❌ Error leaving community:", err);
    next(err);
  }
});

// **Get all communities a user is in**
router.get("/user/:username", isLoggedIn, async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }
    const communities = await fetchUserCommunities(username);
    if (!communities || communities.length === 0) {
      return res.status(404).json({ error: "User is not part of any community" });
    }
    res.status(200).json(communities);
  } catch (err) {
    console.error("Error fetching user's communities:", err.message);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

module.exports = router;