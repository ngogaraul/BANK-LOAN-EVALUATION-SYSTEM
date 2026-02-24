import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import ApplicationDetails from "./pages/ApplicationDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";
import NewClient from "./pages/NewClient";
import NewApplication from "./pages/NewApplication";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell><Dashboard /></AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <AppShell><Applications /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/new"
          element={
            <ProtectedRoute>
              <AppShell><NewApplication /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute>
              <AppShell><ApplicationDetails /></AppShell>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <AppShell><Clients /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/new"
          element={
            <ProtectedRoute>
              <AppShell><NewClient /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <ProtectedRoute>
              <AppShell><ClientDetails /></AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
