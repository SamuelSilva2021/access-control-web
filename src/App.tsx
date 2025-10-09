import { ThemeProvider, QueryProvider, RouterProvider, AuthProvider } from './app/providers';
import { AppRoutes } from './app/routes';

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
