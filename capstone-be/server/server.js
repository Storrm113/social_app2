// server.js
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app"); // Import Express app

const server = http.createServer(app);

// ✅ Socket.io Setup
const io = new Server(server, {
  cors: { origin: "*" },
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

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
