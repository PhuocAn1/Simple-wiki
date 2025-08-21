import { useState, useEffect } from 'react';
import Header from '../../common/Header/Header';
import './LogInPage.css';
import { authenticate } from '../../services/AuthenticationService';
import {useAuth} from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const LogInPage = () => {
  const location = useLocation();
  const [loginRequest, setLoginRequest] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState(null);
  const {setIsLoggedIn, setUsername, setToken, setUserId} = useAuth();
  const navigate = useNavigate(); // Add navigate

  const handleInputChange =  (e) => {
    const { name, value, type, checked } = e.target;
    setLoginRequest(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const from = location.state?.from?.pathname || '/';
  
  const channel = new BroadcastChannel('authChannel');
  // Close the channel when the LogInPage.jsx unmount, preventing leak
  useEffect(() => {
    return () => {
      channel.close();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', loginRequest);

    try {
      const token = await authenticate(loginRequest.username, loginRequest.password, loginRequest.rememberMe);
      console.log(token);
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      console.log('User ID:', userId);

      // Store auth data in localStorage
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('username', loginRequest.username);
      localStorage.setItem('userId', userId);
      if (loginRequest.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.setItem('rememberMe', 'false');
      }

      // Update context state (this triggers useEffect in AuthContext to sync state)
      setToken(token);
      setUsername(loginRequest.username);
      setUserId(userId);
      setIsLoggedIn(true);

      // No need to set appSessionActive here; AuthContext handles it
      sessionStorage.setItem('appSessionActive', 'true');
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="wiki-container">
        <Header />

         <div className="login-container">
           <h2>Log in</h2>

           {error && <div className="error-message">{error}</div>}

           <p className="login-note">Login processing now uses our domain, auth.wikimedia.org. If you are using blocking software, you will need to allow access to this domain to log in. (technical details)</p>
           <form onSubmit={handleSubmit} className="login-form">
             <div className="form-group">
               <label htmlFor="username">Username</label>
               <input
                 type="text"
                 id="username"
                 name="username"
                 value={loginRequest.username}
                 onChange={handleInputChange}
                 placeholder="Enter your username"
                 required
               />
             </div>
             
             <div className="form-group">
               <label htmlFor="password">Password</label>
               <input
                 type="password"
                 id="password"
                 name="password"
                 value={loginRequest.password}
                 onChange={handleInputChange}
                 placeholder="Enter your password"
                 required
               />
             </div>

             <div className="form-group remember-me">
               <input
                 type="checkbox"
                 id="rememberMe"
                 name="rememberMe"
                 checked={loginRequest.rememberMe}
                 onChange={handleInputChange}
               />
               <label htmlFor="rememberMe">Keep me logged in (for up to one year)</label>
             </div>

             <button type="submit" className="login-button">Log in</button>
           </form>

           <div className="join-link">
             <p>Don't have an account?</p>
             <a href="/create-account" className="join-button">Join Simple Wiki</a>
           </div>
           
         </div>
    </div>
  );
};

export default LogInPage;
