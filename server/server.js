const express = require("express");
const app = express();

// Connecting to MongoDB using Mongoose and importing the Document model
const mongoose = require("mongoose");
const Document = require("./DocumentSchema");

mongoose.connect("mongodb://127.0.0.1:27017/documentAutosave").then((data) => {
  console.log(`Mongodb connected with server: ${data.connection.host}`);
});

// Setting up Socket.io with CORS configuration
const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Handling socket connections
io.on("connection", (socket) => {
  // Handling the event when a client requests a document
  socket.on("get-document", async (documentId) => {
    // Retrieving the document and joining the socket room for that document
    const document = await getDocument(documentId);
    socket.join(documentId);

    // Emitting the document data to the requesting client
    socket.emit("load-document", document.data);

    // Handling the event when a client sends changes to the document
    socket.on("send-changes", (delta) => {
      // Broadcasting the changes to all other clients in the same room
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    // Handling the event when a client saves the document
    socket.on("save-document", async (data) => {
      // Updating the document in the database
      await updateDocument(documentId, data);
    });
  });
});

// Default value for the document content
const defaultValue = "";

// Function to get a document by ID from the database
async function getDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}

// Function to update a document in the database by ID
async function updateDocument(id, data) {
  return await Document.findByIdAndUpdate(id, { data });
}

// Setting up the server to listen on a specified port
const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log(`server is working on ${PORT}`);
});
