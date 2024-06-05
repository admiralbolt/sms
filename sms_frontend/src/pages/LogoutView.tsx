import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { logout, useIsAuthenticated } from "@/hooks/auth";

export const LogoutView = () => {
  const [_, setIsAuthenticated] = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await logout();

      setIsAuthenticated(false);
      navigate("/login");
    })();
  }, [navigate, setIsAuthenticated]);

  return <div></div>;
};
