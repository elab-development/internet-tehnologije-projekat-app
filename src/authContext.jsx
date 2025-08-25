// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token")); // Use localStorage
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem("user_role") || "user");

  useEffect(() => {
    if (token) {
      setIsAdmin(role === 'admin'); // Only admin users have isAdmin true
      
      // Fetch current user data to ensure we have the latest role
      const fetchUserData = async () => {
        try {
          const response = await axios.get('/api/user', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userRole = response.data.role;
          if (userRole !== role) {
            setRole(userRole);
            localStorage.setItem("user_role", userRole);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchUserData();
    } else {
      setIsAdmin(false);
      setRole('user');
    }
  }, [token, role]);

  const addToken = (newToken, userRole = 'user') => {
    setToken(newToken);
    setRole(userRole);
    localStorage.setItem("auth_token", newToken); // Store in localStorage
    localStorage.setItem("user_role", userRole); // Store role in localStorage
  };

  const logout = async () => {
    try {
      await axios.post('/api/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setToken(null);
      localStorage.removeItem("auth_token"); // Remove from localStorage
      localStorage.removeItem("user_role"); // Remove role from localStorage
      setIsAdmin(false);
      setRole('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isModerator = role === 'moderator';
  const isModeratorOrAdmin = role === 'moderator' || role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      token, 
      isAdmin, 
      isModerator, 
      isModeratorOrAdmin, 
      role, 
      addToken, 
      setIsAdmin, 
      setRole, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};