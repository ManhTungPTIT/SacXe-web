import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) return null;

  if (!user) return <Navigate to="/auth/login" replace />;

  return children;
};

export default PrivateRoute;
