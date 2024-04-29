import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { logout, useIsAuthenticated } from '@/hooks/auth';

const LogoutView = () => {
  const [_, setIsAuthenticated] = useIsAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const result = await logout();

      if (result === null) {
        setIsAuthenticated(false);
        navigate('/login');
      } else {
        console.log('LOGOUT BUSTED', result);
      }
    })();
  }, []);

  return <div></div>;
};

export default LogoutView;
