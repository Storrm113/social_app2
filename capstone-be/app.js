const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const communityRoutes = require("./server/api/communityRoutes"); // Ensure correct import
const userRoutes = require("./server/api/userRoutes");
const { sendDirectMessage, fetchDirectMessages } = require("./server/db/message");

const app = express();
const server = http.createServer(app);

// ✅ CORS Configuration
const corsOptions = {
  origin: "https://tigers-social-app.netlify.app", // Allow frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions)); // ✅ Apply CORS middleware
app.use(express.json()); // ✅ Ensure JSON body parsing

// ✅ Register Routes Correctly
app.use("/api/communities", communityRoutes); // Ensure this matches the frontend call
app.use("/api/users", userRoutes);

// ✅ Socket.io Real-Time Connection
const io = new Server(server, {
  cors: {
    origin: "https://tigers-social-app.netlify.app", // Ensure Socket.io allows frontend requests
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    try {
      const message = await sendDirectMessage({ senderId, receiverId, content });
      io.to(receiverId).emit("receiveMessage", message);
      io.to(senderId).emit("receiveMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ API Route to Fetch Direct Messages
app.get("/messages/direct/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await fetchDirectMessages(senderId, receiverId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Catch-all Route to Handle Undefined API Calls
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
