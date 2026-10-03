import express from "express";
import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import projectRoutes from "./routes/projectRoutes.js"; // Import project routes
import taskRoutes from "./routes/taskRoutes.js"; // Import task routes
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js"; 
import profileRoutes from "./routes/profileRoutes.js";
import cors from "cors";
const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/projects", projectRoutes); // Use project routes
app.use("/api/tasks", taskRoutes); // Use task routes
app.use("/api/comments", commentRoutes); 
app.use("/api/notifications", notificationRoutes); 
app.use("/api/profile", profileRoutes);

export default app;