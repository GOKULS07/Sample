import React, { createContext, useState, useContext, useEffect } from 'react'; // React essentials for context and state
import axios from 'axios'; // Our tool for making HTTP requests to the backend

// We create a "context" here. Think of it as a global storage space
// where we keep track of our user's login status and info.
const AuthContext = createContext(null);

// This is our AuthProvider. It's a special component that wraps around our whole app
// so all parts of the app can easily know who's logged in.
export const AuthProvider = ({ children }) => {
  // We try to load user and token from local storage when the app starts.
  // This keeps the user logged in even if they refresh the page.
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null; // If user data is found, parse it from JSON
    } catch (error) {
      console.error("Couldn't read user data from local storage:", error);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null); // Load the token too

  // This runs whenever the 'token' changes. It sets up Axios (our HTTP client)
  // to automatically include the authorization token in every request.
  useEffect(() => {
    if (token) {
      // If we have a token, add it to the default Authorization header for all Axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      // If there's no token, remove the Authorization header
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]); // This effect re-runs if the 'token' state changes

  // This function handles user login.
  // It talks to the backend to verify credentials and get a token.
  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json', // We're sending JSON data
        },
      };
      // Send a POST request to our backend's login endpoint
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/login', // The URL for our backend login API
        { email, password }, // The data we're sending
        config // Our request configuration (headers)
      );

      // If login is successful, store user data and token in state and local storage
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      return { success: true, user: data.user }; // Tell the component that login worked
    } catch (error) {
      console.error('Login problem:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' }; // Tell the component login failed
    }
  };

  // This function handles new user registration.
  // It sends new user data to the backend to create an account.
  const register = async (userData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      // Send a POST request to our backend's registration endpoint
      const { data } = await axios.post(
        'http://localhost:5000/api/auth/register',
        { email: userData.email, password: userData.password, mobileNumber: userData.mobile, role: userData.role }, // User data to send
        config
      );

      return { success: true, message: data.message || 'Registration successful' }; // Tell the component registration worked
    } catch (error) {
      console.error('Registration problem:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // This function handles logging out a user.
  // It clears their data from state and local storage.
  const logout = () => {
    setUser(null); // Clear user from state
    setToken(null); // Clear token from state
    localStorage.removeItem('user'); // Remove user from local storage
    localStorage.removeItem('token'); // Remove token from local storage
    delete axios.defaults.headers.common['Authorization']; // Remove the authorization header from Axios
    console.log('User logged out.');
  };

  // This is the object that our components can "subscribe" to.
  // It provides current user info, login/logout/register functions, and boolean flags.
  const contextValue = {
    user, // The current logged-in user object
    token, // The current JWT token
    login, // Our login function
    logout, // Our logout function
    register, // Our register function
    isAuthenticated: !!user, // A quick check: is there a user? (true/false)
    isHouseOwner: user && user.role === 'house_owner', // Is the logged-in user a house owner?
    isCustomer: user && user.role === 'customer', // Is the logged-in user a customer?
  };

  return (
    // We provide the contextValue to all child components wrapped by AuthProvider
    <AuthContext.Provider value={contextValue}>
      {children} {/* This represents all the components wrapped by AuthProvider */}
    </AuthContext.Provider>
  );
};

// This is a custom hook that makes it easy for any component to access our AuthContext values.
export const useAuth = () => {
  const context = useContext(AuthContext); // Grabs the current context value
  if (!context) {
    // If someone tries to use useAuth outside of AuthProvider, throw an error
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // Return the context values
};