import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        'https://room-booker.onrender.com/api/auth/login', 
        { email, password },
        config
      );

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
     
      const { data } = await axios.post(
        'https://room-booker.onrender.com/api/auth/register', // Your backend register endpoint
        { email: userData.email, password: userData.password, mobileNumber: userData.mobile, role: userData.role },
        config
      );

      return { success: true, message: data.message || 'Registration successful' };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization']; 
    console.log('User logged out.');
  };

  const contextValue = {
    user,
    token,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isHouseOwner: user && user.role === 'house_owner',
    isCustomer: user && user.role === 'customer',
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
