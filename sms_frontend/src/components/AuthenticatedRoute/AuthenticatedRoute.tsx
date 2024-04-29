import { Navigate, Route } from 'react-router-dom';

import { useIsAuthenticated } from '@/hooks/auth';

const AuthenticatedRoute = ({ element: Component, ...rest }: any) => {
  const [isAuthenticated] = useIsAuthenticated();

  return (
    <Route
      {...rest}
      render={(props: any) => {
        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Navigate to={{ pathname: '/login' }} />
        );
      }}
    />
  );
};

export default AuthenticatedRoute;
