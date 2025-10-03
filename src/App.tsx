import { ThemeProvider, QueryProvider, RouterProvider, AuthProvider } from './app/providers';
import { AppRoutes } from './app/routes';

/**
 * Componente principal da aplicação Access Control
 * Configura todos os providers e rotas
 */
function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <RouterProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </RouterProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
