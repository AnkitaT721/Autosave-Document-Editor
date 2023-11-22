import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const DocEditor = () => {
  // Extracting documentId from URL params
  const { id: documentId } = useParams();

  // State for managing socket and Quill instances
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  //setting up the socket connection
  useEffect(() => {
    // Creating a socket connection to the server
    const socketServer = io("http://localhost:3001");
    setSocket(socketServer);

    // Cleaning up the socket connection when the component unmounts
    return () => {
      socketServer.disconnect();
    };
  }, []);

  //handling initial loading of the document
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Once the "load-document" event is received, set the Quill contents and enable editing
    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    // Emitting the "get-document" event to request the document from the server
    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  //periodically saving the document
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Set up an interval to periodically emit "save-document" event with the document contents
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);

    // Cleaning up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  // handling incoming changes from other users
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Set up a socket listener for "receive-changes" and update the Quill contents
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    // Cleaning up the socket listener when the component unmounts
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  // handling user changes and emitting them to the server
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Set up a Quill listener for "text-change" and emit "send-changes" to the server
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);

    // Cleaning up the Quill listener when the component unmounts
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  // Callback function to initialize the Quill editor
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    // Clearing the wrapper content and creating a new Quill editor instance
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const quillServer = new Quill(editor, {
      theme: "snow",
    });

    // Disable the editor and display a loading message
    quillServer.disable();
    quillServer.setText("Loading...");

    // Setting the Quill instance in the state
    setQuill(quillServer);
  }, []);

  // Rendering the container for the Quill editor
  return <div className="container" ref={wrapperRef}></div>;
};

export default DocEditor;
