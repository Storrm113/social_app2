const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const pool = require("./server/db");
const { sendDirectMessage, fetchDirectMessages } = require("./server/db/message");
const communityRoutes = require("./server/api/communityRoutes");
const userRoutes = require("./server/api/userRoutes"); // ✅ Ensure user routes are included

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// ✅ CORS Configuration
const corsOptions = {
  origin: "https://tigers-social-app.netlify.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Register Routes
app.use("/api/community", communityRoutes);
app.use("/api/users", userRoutes); // ✅ Register user routes properly

// ✅ Socket.io Real-Time Connection
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

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
