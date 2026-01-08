import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/EventoDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeRedirect from "./pages/HomeRedirect";
import Eventos from "./pages/Eventos";
import EventoForm from "./pages/EventoForm";
import EventoDashboard from "./pages/EventoDashboard";



export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ROTA / */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>}/>
          <Route path="/evento" element={<ProtectedRoute><EventoDashboard /></ProtectedRoute>}/>
          <Route path="/evento/editar" element={<ProtectedRoute><EventoForm /></ProtectedRoute>} /></Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
