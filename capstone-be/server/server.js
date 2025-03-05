const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const pool = require("./db");
const { sendDirectMessage, fetchDirectMessages } = require("./message");
const communityRoutes = require("./api/communityRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }, // Allow all origins (update for security)
});

// ✅ **Step 2: Fix CORS Configuration**
const corsOptions = {
  origin: "https://tigers-social-app.netlify.app", // Allow only frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies/auth headers
};

app.use(cors(corsOptions));
app.use(express.json());

// **Register Routes**
app.use("/api/community", communityRoutes);

// **Socket.io Real-Time Connection**
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    try {
      const message = await sendDirectMessage({
        senderId,
        receiverId,
        content,
      });

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

// **API Route to Fetch Direct Messages**
app.get("/messages/direct/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await fetchDirectMessages(senderId, receiverId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
