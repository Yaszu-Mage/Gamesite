const express = require("express");
const { Socket } = require("node:dgram");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { title } = require("node:process");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);
var blogcount = 0;
app.get("/tetris", (req, res) => {
  res.sendFile(join(__dirname, "tetris.html"));
});
app.get("/blog", (req, res) => {
  res.sendFile(join(__dirname, "blog.html"));
});
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

io.on("connection", (socket) => {
  socket.on("new-post", (title, content) => {
    console.log("recieved post");
    io.emit("new-post", title, content);
  });
});

io.on("connection", (socket) => {
  socket.on("homebuttonserve", () => {
    console.log("homeworks");
  });
  socket.on("userconnectblog", () => {
    blogcount += 1;
    console.log(
      "a user is connecting to blog, there is currently " +
        blogcount +
        " person(s) on the blog",
    );
  });
});
server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
