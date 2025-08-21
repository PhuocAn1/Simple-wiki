import {useState, useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPageContentByTitle } from '../../services/PageService';
import Header from '../../common/Header/Header';
import './UserPage.css';
import '../WikiTextStyling/WikiTextStyle.css'

const UserPage = () => {
  //const username = localStorage.getItem('username') || 'User';
  // Change to get the pagetitle and not username from param
  const [pageContent, setPageContent] = useState(null);
  const [pageTitle, setPageTitle] = useState("User:user");
  const [loading, setLoading] = useState(true);
  const { username } = useParams();
  const decodedUsername = decodeURIComponent(username || 'user');
  
  useEffect(() => {
    const fetchUserPage = async () => {
      try {
        console.log("Getting page content for: User:" + username);
        const userPageDTO = await getPageContentByTitle("User:" + username);
        console.log(userPageDTO);
        
        setPageContent(userPageDTO.pageRevisionDTO.content);
        setPageTitle(userPageDTO.title);
        //console.log(pageContent);
        
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setPageContent(null);
        console.log(error.message);
      }
    }

    fetchUserPage();
  }, [username, pageContent, pageTitle])

  return (
    <div className="wiki-container">
      <Header/>
      <div className="subheader">
        <Link to={`/user/${encodeURIComponent(decodedUsername)}`} className="subheader-link active">User page</Link>
        <Link to={`/edit-source?username=${encodeURIComponent(decodedUsername)}`} className="subheader-link">Edit source</Link>
      </div>
      <div className="page-content">
        {/* 
        This heading need to get the title for the user from the database
        If no page with title User:username, then display the below html
        Since a userpage must be User:username, we dont need to get the page title from the page
        , only need to get the page content
        */}
        

        {loading ? (
        <p>Loading user page...</p>
        ) : pageContent ? (
          <>
            <h1 className='username-heading'>{pageTitle}</h1>
            <div className="preview-content" dangerouslySetInnerHTML={{ __html: pageContent }}>
            </div>
          </> 
        ) : (
          /* 
            This line will be displayed if the page for username does not exist, meaning the user has just created their account or 
            they havent hit the edit source button and create a page for them.
          */
         <>
            <h1 className='username-heading'>User:{username}</h1>
            <p>
              There is currently no user page for User:{username}. You can create one for yourself by going into the edit source page and create 
              one for you.
            </p>
         </>
 
        )}

      </div>
    </div>
  );
};

export default UserPage;