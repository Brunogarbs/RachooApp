import { Navigate } from "react-router-dom";

export default function HomeRedirect() {
  const token = localStorage.getItem("token");
  const eventoId = localStorage.getItem("eventoId");

  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return <Navigate to="/eventos" />;
}
