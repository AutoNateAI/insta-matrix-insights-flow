
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { DataProvider } from './contexts/DataContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
import { MemeProvider } from './contexts/MemeContext.tsx';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <DataProvider>
      <CartProvider>
        <MemeProvider>
          <App />
        </MemeProvider>
      </CartProvider>
    </DataProvider>
  </AuthProvider>
);
