import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoutes";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";


import Home from "./pages/public/Home";
import Workspace from "./pages/public/Workspace";
import WorkspaceDetail from "./pages/public/WorkspaceDetail";
import Projects from "./pages/public/Projects";
import ProjectDetails from "./pages/public/ProjectDetails";
import TaskDetails from "./pages/public/TaskDetails";
import Notifications from "./pages/public/Notifications";
import Profil from "./pages/public/Profil";
import Setting from "./pages/public/Setting";

function App() {
  return (
    
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        
        <Route path="/" element={<Navigate to="/home" replace />} />

       <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/workspaces" element={<Workspace />} />
          <Route path="/workspaces/:id" element={<WorkspaceDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profil />} />
          <Route path="/settings" element={<Setting />} />
        </Route>
        </Route>

      </Routes>
    
  );
}

export default App;