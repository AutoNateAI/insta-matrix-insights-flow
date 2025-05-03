
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User } from '../types';
import { toast } from 'sonner';

// Predefined admin credentials
const ADMIN_USERNAME = 'autonate.ai';
const ADMIN_PASSWORD = 'goodlucky456';

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for existing auth on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('instagram-analytics-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(parsedUser.isAuthenticated);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('instagram-analytics-user');
      }
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Check against predefined credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const userData: User = {
        username,
        isAuthenticated: true,
      };
      
      // Store in local storage
      localStorage.setItem('instagram-analytics-user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('Successfully logged in');
      return true;
    } else {
      toast.error('Invalid credentials');
      return false;
    }
  };

  const logout = () => {
    // Clear from local storage
    localStorage.removeItem('instagram-analytics-user');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
