const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const port = process.env.PORT || 4000;

const app = express();
app.use(cors());
const server = http.createServer(app);

const UserInRoom = {};

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "https://collabrative-code-editor.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
  // transports: ['websocket'],
});

io.on("connection", (socket) => {
  socket.on("join_document", (roomId, username) => {
    socket.join(roomId);
    if (!UserInRoom[roomId]) UserInRoom[roomId] = [];

    const user = { socketId: socket.id, name: username };
    UserInRoom[roomId].push(user);
    // console.log("USer - -", user);
    io.to(roomId).emit("users-in-room", UserInRoom[roomId]);

    console.log(`User Joined Room: ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code, file, lang }) => {
    // console.log(`Received code change for docId: ${code}`);
    socket.to(roomId).emit("changes", { code, file, lang });
  });

  socket.on("disconnect", () => {
    for (const roomId in UserInRoom) {
      console.log("User Disconnected", socket.id);
      UserInRoom[roomId] = UserInRoom[roomId].filter(
        (user) => user.socketId !== socket.id
      );
      io.to(roomId).emit("users-in-room", UserInRoom[roomId]);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
