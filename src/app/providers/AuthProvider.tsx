import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../shared/stores';
import { ROUTES } from '../../shared/constants';

interface AuthProviderProps {
  children: ReactNode;
}

let hasGloballyInitialized = false;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isReady, setIsReady] = useState(hasGloballyInitialized);
  const { initialize, logout } = useAuthStore();
  const navigate = useNavigate();
  const initRef = useRef(hasGloballyInitialized);

  useEffect(() => {
    const handleTokenExpired = () => {
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, [logout, navigate]);

  useEffect(() => {
    if (hasGloballyInitialized || initRef.current) {
      if (!isReady) setIsReady(true);
      return;
    }
    
    initRef.current = true;
    hasGloballyInitialized = true;
    
    const initializeAuth = async () => {
      try {
        await initialize();
      } catch (error) {
      } finally {
        setIsReady(true);
      }
    };
    
    setTimeout(initializeAuth, 100);
    
  }, []);

  if (!isReady) {
    return <div>Inicializando autenticação...</div>;
  }

  return <>{children}</>;
};