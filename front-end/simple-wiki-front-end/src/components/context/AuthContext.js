import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getToken, logout } from '../services/AuthenticationService';
import { validateToken } from '../services/AuthenticationService';
import { v4 as uuidv4 } from 'uuid';
import { apiLogger } from '../services/Api';
import API_BASE_URL from "../config";

const AuthContext = createContext();

export const getStoredItem = (key) => {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getStoredItem('jwtToken'));
  const [username, setUsername] = useState(() => getStoredItem('username') || '');
  const [userId, setUserId] = useState(() => getStoredItem('userId') || '');
  const [token, setToken] = useState(() => getStoredItem('jwtToken'));
  const [hydrated, setHydrated] = useState(false);

  // Initialize BroadcastChannel
  const channel = new BroadcastChannel('authChannel');

  // Function to sync state with storage
  const syncAuthState = () => {
    const token = getStoredItem('jwtToken');
    const storedUsername = getStoredItem('username');
    const userId = getStoredItem('userId');

    setIsLoggedIn(!!token);
    setUsername(storedUsername || '');
    setUserId(userId || '');
    setToken(token);
  };

  // Auto-login logic
  useEffect(() => {
    const autoLogin = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwtToken');
        const username = localStorage.getItem('username');
        const userId = localStorage.getItem('userId');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';

        console.log({token, username, userId, rememberMe});

        if (token && username && userId) {
          try {
            const isValidToken = await validateToken(token);
            let shouldReset = !isValidToken;

            if (!shouldReset && !rememberMe) {
              const isNewSession = !sessionStorage.getItem('appSessionActive');
              console.log({isNewSession});

              if (isNewSession) {
                // Check for active tabs
                const sessionCheckId = uuidv4();
                let hasActiveTabs = false;

                // Set up temporary message handler for session check
                const handleMessage = (event) => {
                  if (event.data?.type === 'sessionCheckResponse' && event.data.sessionCheckId === sessionCheckId) {
                    hasActiveTabs = true;
                  }
                };

                channel.addEventListener('message', handleMessage);
                channel.postMessage({ type: 'sessionCheck', sessionCheckId });

                // Wait for responses or timeout (increased to 500ms for reliability)
                await new Promise((resolve) => {
                  setTimeout(() => {
                    channel.removeEventListener('message', handleMessage);
                    resolve();
                  }, 500);
                });

                shouldReset = !hasActiveTabs;
              } else {
                // Existing session in sessionStorage, no need to reset
                shouldReset = false;
              }
            }

            if (shouldReset) {
              resetAuth(false);
            } else {
              // Set auth state for valid session or rememberMe true
              setIsLoggedIn(true);
              setUsername(username);
              setUserId(userId);
              setToken(token);
              sessionStorage.setItem('appSessionActive', 'true');
              console.log("Setting the appSessionActive: true");
            }
          } catch (error) {
            apiLogger('Token validation failed:', error);
            resetAuth(false);
          }
        } else {
          resetAuth(false);
        }

        setHydrated(true);
      }
    };
    autoLogin();
  }, []);

  // Respond to session checks from other tabs
  useEffect(() => {
    const handleSessionCheck = (event) => {
      if (event.data?.type === 'sessionCheck' && sessionStorage.getItem('appSessionActive')) {
        channel.postMessage({
          type: 'sessionCheckResponse',
          sessionCheckId: event.data.sessionCheckId,
        });
      }
    };
    channel.addEventListener('message', handleSessionCheck);
    return () => channel.removeEventListener('message', handleSessionCheck);
  }, []);

  // Sync storage changes across tabs
  useEffect(() => {
    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  // Handle logout broadcasts
  useEffect(() => {
    const handleLogoutMessage = (event) => {
      if (event.data?.type === 'logout') {
        resetAuth(false);
      }
    };
    channel.addEventListener('message', handleLogoutMessage);
    return () => channel.removeEventListener('message', handleLogoutMessage);
  }, []);

  // Detect when all tabs are closed to clear session
  useEffect(() => {
    const handleTabClose = () => {
      if (!sessionStorage.getItem('appSessionActive')) return;

      const sessionCheckId = uuidv4();
      let hasActiveTabs = false;

      const handleMessage = (event) => {
        if (event.data?.type === 'sessionCheckResponse' && event.data.sessionCheckId === sessionCheckId) {
          hasActiveTabs = true;
        }
      };

      channel.addEventListener('message', handleMessage);
      channel.postMessage({ type: 'sessionCheck', sessionCheckId });

      setTimeout(() => {
        channel.removeEventListener('message', handleMessage);
        if (!hasActiveTabs) {
          resetAuth(false);
        }
      }, 500);
    };

    window.addEventListener('beforeunload', handleTabClose);
    return () => window.removeEventListener('beforeunload', handleTabClose);
  }, []);

  const handleLogOut = () => {
    logout();
    resetAuth(true);
  };

  const resetAuth = (shouldBroadcast = true) => {
    console.log(`Resetting auth, should broadcast: ${shouldBroadcast}`);
    setToken(null);
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');

    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('appSessionActive');
    sessionStorage.removeItem('isVerified');
    sessionStorage.clear();

    if (shouldBroadcast) {
      console.log("Broadcasting logout message");
      channel.postMessage({ type: 'logout' });
    }
  };

  const value = useMemo(() => ({
    token,
    setToken,
    isLoggedIn,
    setIsLoggedIn,
    handleLogOut,
    username,
    setUsername,
    userId,
    setUserId,
    resetAuth,
  }), [token, isLoggedIn, username, userId]);

  // Cleanup channel on unmount
  useEffect(() => {
    return () => channel.close();
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {hydrated ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);