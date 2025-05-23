// Run multiplayer server using socket.io
// socket.io is a library that enables real-time, bidirectional communication between web clients and servers.
// bidirectional means that both the client and server can send messages to each other at any time.
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve all files in the public folder
app.use(express.static(path.join(__dirname, "../public")));

let players = [];

// Runs every time a new player connects
io.on("connection", (socket) => { // socket represents the player's connection
  console.log("New player connected:", socket.id);

  const playerNumber = players.length;
  players.push(socket);
  socket.emit("playerNumber", playerNumber);

  // When a player moves their paddle, client sends "paddleMove" events with the new paddle position\
  // server listens for "paddleMove" events
  socket.on("paddleMove", (data) => {
    // forward the paddle position to the other player
    socket.broadcast.emit("opponentMove", data);
  });

  // synchronize the ball position between players
  socket.on("ballData", (data) => {
    socket.broadcast.emit("ballData", data);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
