import React, { createContext, useContext, useState, useEffect } from 'react';
import { PropsWithChildren } from 'react';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface do usuário autenticado.
 */
interface User {
  _id: string;
  name: string;
  email: string;
  isVerified?: boolean;
  profileImage?: string;
}

/**
 * Interface do contexto de autenticação.
 */
interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
}

// Criação do contexto
const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  updateUser: () => {},
});

/**
 * Provider do contexto de autenticação.
 */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  /**
   * Realiza login do usuário.
   */
  const login = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      const userData = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        isVerified: response.data.isVerified,
        profileImage: response.data.profileImage
      };

      setUser(userData);
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Falha no login');
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Realiza logout do usuário.
   */
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  /**
   * Atualiza dados do usuário no contexto e no armazenamento local.
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
    }
  };

  // Carrega usuário salvo no AsyncStorage ao iniciar o app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Adiciona timestamp para evitar cache
          if (parsedUser.profileImage) {
            parsedUser.profileImage = `${parsedUser.profileImage}?v=${Date.now()}`;
          }
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setAuthLoading(false);
      }
    };
  
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading: authLoading, 
      login, 
      logout,
      isAuthenticated: !!user,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de autenticação.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};