import Header from "../../common/Header/Header";
import styles from "./ListFilesPage.module.css";
import MediaTable from "../../common/MediaTable/MediaTable";
import { useState, useEffect, useRef } from "react";
import { getAllMultimedia } from "../../services/MultiMediaService";
import { suggestUsernames } from "../../services/UserService";
import React from "react";

export const ListFilesPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [mediaData, setMediaData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionRefs = useRef([]);
  const dropdownRef = useRef(null);
  
  const [suggestionNameList, setsuggestionNameList] = useState([]);

  const searchButtonClicked = async (e) => {
    e.preventDefault();
    try {
      const multimediaList = await getAllMultimedia(searchUsername);
      console.log("Multimedia list: ", multimediaList);
      setMediaData(multimediaList);
      setSuggestions([]); // Ensure dropdown closes after search
      setActiveIndex(-1);
    } catch (error) {
      console.error("Failed to fetch multimedia:", error);
    }
  };

  useEffect(() => {
    const loadAllMultimedia = async () => {
      try {
        const multimediaList = await getAllMultimedia();
        console.log("Multimedia list: ", multimediaList);
        setMediaData(multimediaList);
      } catch (error) {
        console.error("Error loading multimedia:", error);
      }
    };

    loadAllMultimedia();
  }, []);

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
        setSearchUsername(suggestions[activeIndex]);
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
        inputRef.current.focus();
      } else if (suggestionRefs.current[newIndex]) {
        suggestionRefs.current[newIndex].focus();
        suggestionRefs.current[newIndex].scrollIntoView({ block: "nearest" });
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      setSearchUsername(suggestions[index]);
      setSuggestions([]); // Clear suggestions immediately
      setActiveIndex(-1);
      inputRef.current.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSuggestions([]);
      setActiveIndex(-1);
      inputRef.current.focus();
    }
  };

  // Handle suggestion logic
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const fetchSuggestions = async () => {
        if (searchUsername.trim() === "") {
          setSuggestions([]);
          setActiveIndex(-1);
          return;
        }

        const result = await suggestUsernames(searchUsername);
        setsuggestionNameList(result);

        if (result.includes(searchUsername)) {
          setSuggestions([]);
          setActiveIndex(-1);
          return;
        }

        setSuggestions(result);
        suggestionRefs.current = result.map(() => null);
      };

      fetchSuggestions();
    }, 300); // adjust this delay to what feels right

    return () => clearTimeout(debounceTimeout);
  }, [searchUsername]);

  // Handle click on suggestion
  const handleSuggestionClick = (name) => {
    setSearchUsername(name);
    setSuggestions([]); // Clear suggestions immediately
    setActiveIndex(-1);
    inputRef.current.focus();
  };

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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.autocomplete = 'off';
      setSearchUsername('');
    }
  }, [inputRef]);

  return (
    <div className="wiki-container">
      <Header />
      <div className="page-content">
        <h1 className="username-heading">File list</h1>
        <div className={styles.filesListContent}>
          <div className={styles.imageListSummary}>
            <p>
              This special page lists all files that have been uploaded directly to this wiki. Other files not listed here may be available for use,
              including files on the wiki.gg Commons wiki and in some cases a "local file repository" wiki
              (the English wiki in multi-language wiki families, and occasionally a related wiki such as the main game wiki sharing files with the wiki for a mod of that game).
            </p>
          </div>

          <div className={styles.imageSearchBox}>
            <div className={styles.searchBar}>
              <label htmlFor="searchUsername">Username:</label>
              <input
                id="searchUsername"
                name="searchUsername"
                type="text"
                size={100}
                autoComplete="new-password"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={handleKeyNavigation}
                ref={inputRef}
              />
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
            <button
              className="preview-button"
              type="button"
              onClick={searchButtonClicked}
              title="Search"
            >
              Search
            </button>
          </div>
        </div>

        <div className={styles.tableContent}>
          <MediaTable data={mediaData} />
        </div>
      </div>
    </div>
  );
};

export default ListFilesPage;