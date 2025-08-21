import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import {useAuth} from '../../context/AuthContext';
import {FaChevronDown, FaSignOutAlt, FaCog, FaRegUser} from "react-icons/fa";
import { useNavigate, useLocation } from 'react-router-dom';
import { suggestPageTitle } from '../../services/PageService';
import styles from './Header.module.css'

const Header = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";

    const {isLoggedIn, username} = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const {resetAuth, handleLogOut} = useAuth();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef(null);
    const suggestionRefs = useRef([]);
    const dropdownRef = useRef(null);

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      const trimmedQuery = searchQuery.trim();
      const targetPath = `/pages/${encodeURIComponent(trimmedQuery)}`;

      if (trimmedQuery !== "") {
        console.log('Searching for:', trimmedQuery);
        if (location.pathname !== targetPath) {
          navigate(`/pages/${encodeURIComponent(trimmedQuery)}`);
        }
        setSuggestions([]);
        setActiveIndex(-1);
        setSearchQuery('');
      }
    };

    const handleLogout = () => {
      // localStorage.removeItem('jwtToken');
      // localStorage.removeItem('username');
      // localStorage.removeItem('rememberMe');
      // localStorage.removeItem('userId');
      // localStorage.removeItem('sessionActive');
      // localStorage.removeItem('tabCount');
      sessionStorage.clear();

      // Reset the auth
      handleLogOut();
      //resetAuth();
      setShowDropdown(false);

      navigate('/login', { replace: true }); // Replaces history
      console.log('Logged out');
    };

    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    // Handle suggestion logic
    useEffect(() => {
      const debounceTimeout = setTimeout(() => {
        const fetchSuggestions = async () => {
          if (searchQuery.trim() === "") {
            setSuggestions([]);
            setActiveIndex(-1);
            return;
          }
          // To do write a fecth suggest title from the db
          const result = await suggestPageTitle(searchQuery);
      
          // if (result.includes(searchQuery)) {
          //   setSuggestions([]);
          //   setActiveIndex(-1);
          //   return;
          // }
      
          setSuggestions(result);
          suggestionRefs.current = result.map(() => null);
        };
      
        fetchSuggestions();
      }, 200); // adjust this delay to what feels right
      
      return () => clearTimeout(debounceTimeout);
    }, [searchQuery])

    // Handle keyboard navigation from input
    const handleKeyNavigation = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const newIndex = Math.min(prev + 1, suggestions.length - 1);
          if (newIndex >= 0 && suggestionRefs.current[newIndex]) {
            suggestionRefs.current[newIndex].focus();
            suggestionRefs.current[newIndex].scrollIntoView({ block: "nearest" });
          }
          return newIndex;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const newIndex = Math.max(prev - 1, -1);
          if (newIndex === -1) {
            inputRef.current.focus();
          } else if (suggestionRefs.current[newIndex]) {
            suggestionRefs.current[newIndex].focus();
            suggestionRefs.current[newIndex].scrollIntoView({ block: "nearest" });
          }
          return newIndex;
        });
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        if (suggestions[activeIndex]) {
          //setSearchQuery(suggestions[activeIndex]);
          setSearchQuery('');
          setSuggestions([]); // Clear suggestions immediately
          setActiveIndex(-1);
          inputRef.current.focus();
        }
      } else if (e.key === "Escape") {
        setSuggestions([]);
        setActiveIndex(-1);
        inputRef.current.focus();
      }
    };

    // Handle keyboard navigation from suggestion items
    const handleSuggestionKeyDown = (e, index) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const newIndex = Math.min(index + 1, suggestions.length - 1);
        if (newIndex >= 0 && suggestionRefs.current[newIndex]) {
          setActiveIndex(newIndex);
          suggestionRefs.current[newIndex].focus();
          suggestionRefs.current[newIndex].scrollIntoView({ block: "nearest" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const newIndex = Math.max(index - 1, -1);
        setActiveIndex(newIndex);

        if (newIndex === -1) {
          // Focus back to input safely
          if (inputRef.current) {
            inputRef.current.focus();
          }
        } else {
          const ref = suggestionRefs.current[newIndex];
          if (ref) {
            ref.focus();
            ref.scrollIntoView({ block: "nearest" });
          }
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedTitle = suggestions[index];
        const targetPath = `/pages/${encodeURIComponent(selectedTitle.trim())}`;

        if (location.pathname !== targetPath) {
          navigate(targetPath);
        }

        setSuggestions([]); // Clear suggestions immediately
        setActiveIndex(-1);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setSuggestions([]);
        setActiveIndex(-1);
        inputRef.current.focus();
      }
    }

    const handleSuggestionClick = (name) => {
      const targetPath = `/pages/${encodeURIComponent(name.trim())}`;
      setSearchQuery('');
      setSuggestions([]); // Clear suggestions immediately
      setActiveIndex(-1);
      
      const index = suggestions.indexOf(name);
      const el = suggestionRefs.current[index];
      if (el) {
        el.focus();
      }

      if (location.pathname !== targetPath) {
        navigate(targetPath);
      }

      inputRef.current.focus();
    }

    // Handle clicks outside to hide suggestions
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          inputRef.current &&
          dropdownRef.current &&
          !inputRef.current.contains(event.target) &&
          !dropdownRef.current.contains(event.target)
        ) {
          setSuggestions([]); // Clear suggestions when clicking outside
          setActiveIndex(-1);
        }
      };

      // Add event listener
      document.addEventListener('mousedown', handleClickOutside);

      // Cleanup event listener on component unmount
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Clear the search input if path change
    useEffect(() => {
      setSuggestions([]);
      setActiveIndex(-1);
      setSearchQuery('');
    }, [location.pathname]);

    return (
       <div className="header">
         <div className="menu-icon">☰</div>
         <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>Simple Wiki</h1>
         </Link>
         
         <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search Simple Wiki"
                className="search-input"
                onKeyDown={handleKeyNavigation}
                ref={inputRef}
              />
              <button type="submit" className="search-button">Search</button>
            </form>
         
            {suggestions.length > 0 && (
                <ul className={styles.suggestionsDropdown} ref={dropdownRef}>
                  {suggestions.map((name, index) => (
                    <li
                      key={name}
                      ref={(el) => (suggestionRefs.current[index] = el)}
                      tabIndex={0}
                      className={`${styles.suggestionItem} ${index === activeIndex ? styles.active : ""}`}
                      onClick={() => handleSuggestionClick(name)}
                      onKeyDown={(e) => handleSuggestionKeyDown(e, index)}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
            )}
         </div>

         <div className="auth-links">              
            {!isLoggedIn ? (
              <>
                <Link to="/create-account" className="auth-link">Create account</Link>
                <Link to="/login"
                      state={!isLoginPage ? { from: location } : undefined}
                      replace={true}
                      className="auth-link"
                >
                        Log in
                </Link>
              </>
            ) : (
              // <>
              //   <Link to="/login" className="auth-link" onClick={handleLogout}>Log out</Link>
              // </>
              <div className="user-dropdown">
                <div className="user-link-container" >
                  <Link to={'/user/my-info'} className="auth-link">
                    <FaCog />
                  </Link>
                  <Link to={`/user/${encodeURIComponent(username || 'User')}`} className="auth-link">
                    <FaRegUser className="user-icon"/>
                  </Link>
                  <Link to={`/user/${encodeURIComponent(username || 'User')}`} className="auth-link">{username || 'User'}</Link>
                  <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`} onClick={toggleDropdown}><FaChevronDown/></span>
                </div>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className='dropdown-link'>
                      <FaSignOutAlt className="logout-icon" onClick={handleLogout}/>
                      <Link to="/login" className="auth-link" onClick={handleLogout}>Log out</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
         </div>
       </div>
    );
}

export default Header;