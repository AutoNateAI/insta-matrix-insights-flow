
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TimingAnalysis from "./pages/TimingAnalysis";
import ContentAnalysis from "./pages/ContentAnalysis";
import Engagement from "./pages/Engagement";
import HashtagAnalysis from "./pages/HashtagAnalysis";
import NetworkAnalysis from "./pages/NetworkAnalysis";
import UploadPage from "./pages/UploadPage";
import NotFoundPage from "./pages/NotFoundPage";
import CartPage from "./pages/CartPage";
import MemeCreation from "./pages/MemeCreation";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          {/* Redirect root to dashboard or login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/timing" element={
            <ProtectedRoute>
              <TimingAnalysis />
            </ProtectedRoute>
          } />
          
          <Route path="/content" element={
            <ProtectedRoute>
              <ContentAnalysis />
            </ProtectedRoute>
          } />
          
          <Route path="/engagement" element={
            <ProtectedRoute>
              <Engagement />
            </ProtectedRoute>
          } />
          
          <Route path="/hashtags" element={
            <ProtectedRoute>
              <HashtagAnalysis />
            </ProtectedRoute>
          } />
          
          <Route path="/network" element={
            <ProtectedRoute>
              <NetworkAnalysis />
            </ProtectedRoute>
          } />
          
          <Route path="/upload" element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } />
          
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          
          <Route path="/memes" element={
            <ProtectedRoute>
              <MemeCreation />
            </ProtectedRoute>
          } />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
