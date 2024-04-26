import { useIsAuthenticated } from "@/hooks/auth";

export const AdminView = () => {
  const [isAuthenticated] = useIsAuthenticated();

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  return (
    <div>
      {isAuthenticated && <h1>YOU ARE AUTHENTICATED</h1>}
      <br />
      accessToken: {accessToken}
      <br />
      refreshToken: {refreshToken}
    </div>
  );
};
