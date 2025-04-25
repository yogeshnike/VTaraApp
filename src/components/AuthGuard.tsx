import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const isLoginPage = location.pathname === '/login';
    
    if (!isAuthenticated && !isLoginPage) {
      // Redirect to login if not authenticated and not already on login page
      navigate('/login', { replace: true });
    } else if (isAuthenticated && isLoginPage) {
      // Redirect to home if authenticated and on login page
      navigate('/home', { replace: true });
    }
  }, [navigate, location.pathname]);
  
  return <>{children}</>;
}
