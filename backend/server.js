const express = require("express");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

let documents = [];
let notifications = [];

app.post("/upload", upload.array("files"), (req, res) => {

  const files = req.files;

  files.forEach((file) => {

    documents.push({
      name: file.originalname,
      size: file.size,
      path: file.path,
      uploadedAt: new Date(),
    });

  });

  if (files.length > 3) {

    setTimeout(() => {

      const notification = {
        id: Date.now(),
        message: `${files.length} files uploaded successfully`,
        read: false,
        time: new Date(),
      };

      notifications.push(notification);

      io.emit("new-notification", notification);

    }, 3000);

  }

  res.json({
    success: true,
  });

});

app.get("/documents", (req, res) => {
  res.json(documents);
});

app.get("/notifications", (req, res) => {
  res.json(notifications);
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});