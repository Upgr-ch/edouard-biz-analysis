import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Preserve any query params (e.g. Clerk reset tokens) when redirecting
    navigate(`/auth${location.search}`, { replace: true });
  }, [navigate, location.search]);

  return null;
};

export default ResetPassword;
