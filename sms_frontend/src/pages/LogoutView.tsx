import { logout, useIsAuthenticated } from "@/hooks/auth";
import { useEffect } from "react";

const LogoutView = () => {
  const [_, setIsAuthenticated] = useIsAuthenticated();

  useEffect(() => {
    (async() => {
      const result = await logout();

      if (result === null) {
        setIsAuthenticated(false);
        window.location.href = "/login";
      } else {
        console.log("LOGOUT BUSTED", result);
      }
    })();
  }, []);

  return (<div></div>);
};

export default LogoutView;