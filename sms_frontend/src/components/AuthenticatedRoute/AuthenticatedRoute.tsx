import { useIsAuthenticated } from "@/hooks/auth";
import { Component } from "react";
import { Navigate, Route } from "react-router-dom";


const AuthenticatedRoute = ({ element: any, ...rest }) => {
  const [isAuthenticated] = useIsAuthenticated();

  return (
    <Route
      {...rest}
      render={props => {
        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Navigate to={{ pathname: "/login" }} />
        )
      }} />
  );
}

export default AuthenticatedRoute;