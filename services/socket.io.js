import { Server } from "socket.io";
 import http from "http";
 import express from "express";
 import messageModel from "../DB/models/Message.model.js";
 
 const app = express();
 const server = http.createServer(app);
 
 const io = new Server(server, {
   cors: {
     origin: "*",
   },
 });
 
 app.set("io", io);
 
 const userSocketMap = new Map();
 
 export function getReceiverSocketId(userId) {
   return userSocketMap.get(userId);
 }
 
 const sendMessage = async (message) => {
   try {
     const { senderId, receiverId } = message;
     const senderSocketId = userSocketMap.get(senderId);
     const receiverSocketId = userSocketMap.get(receiverId);
 
     // Save message to DB
     const createMessage = await messageModel.create(message);
     const messageData = await messageModel
       .findById(createMessage._id)
       .populate("senderId", "_id email name ")
       .populate("receiverId", "_id email name ")
       .lean();
 
     if (!messageData) return;
 
     // Emit message to sender and receiver if online
     [senderSocketId, receiverSocketId].forEach((socketId) => {
       if (socketId) io.to(socketId).emit("receiveMessage", messageData);
     });
   } catch (error) {
     console.error("Error sending message:", error);
   }
 };
 
 
 io.on("connection", (socket) => {
   console.log(`User connected: ${socket.id}`);
 
   const userId = socket.handshake.query.userId;
   if (userId) {
     userSocketMap.set(userId, socket.id);
     console.log(`Mapped user ${userId} to socket ${socket.id}`);
   }
 
   socket.on("join", (roomID) => {
     socket.join(roomID);
     console.log(`User ${socket.id} joined room: ${roomID}`);
   });
 
   socket.on("sendMessage", sendMessage);
 
   socket.on("disconnect", () => {
     console.log(`User disconnected: ${socket.id}`);
 
     for (const [userId, socketId] of userSocketMap.entries()) {
       if (socketId === socket.id) {
         userSocketMap.delete(userId);
         console.log(`Removed user ${userId} from socket map`);
         break;
       }
     }
   });
 
   socket.on("error", (err) => {
     console.error(`⚠️ Socket.IO Error: ${err.message}`);
   });
 });
 
 export { io, app, server };