import { useIsAuthenticated } from "@/hooks/auth";
import { useEffect } from "react";

const AdminView = () => {
  const [isAuthenticated] = useIsAuthenticated();

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  return (
    <div>
      {(isAuthenticated) && <h1>YOU ARE AUTHENTICATED</h1>}
       <br />
       accessToken: {accessToken}
       <br />
       refreshToken: {refreshToken}
    </div>
  );
}

export default AdminView;