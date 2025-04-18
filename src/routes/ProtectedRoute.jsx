import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <div className="p-6">Carregando...</div>;

  if (!user) return <Navigate to="/" />;
  if (role && userData?.role !== role) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
