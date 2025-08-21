import { useState, useEffect } from "react";
import Header from "../../common/Header/Header"
import { Link, useParams, useLocation } from 'react-router-dom';
import { getPageContentByTitle } from "../../services/PageService";

export const WikiPage = () => {
    const [pageContent, setPageContent] = useState(null);
    const { pageTitle: routeTitle } = useParams(); // get from URL
    const [pageTitle, setPageTitle] = useState("");
    const [loading, setLoading] = useState(false); // Set to true later after implement contact to back end

    // Log component mount/re-render for debugging
    //console.log('WikiPage component mounted or re-rendered');

    useEffect(() => {
        if (routeTitle) {
            setPageTitle(decodeURIComponent(routeTitle).replace(/_/g, ' '));
        }
        fecthPageContent(decodeURIComponent(routeTitle).replace(/_/g, ' '));
    }, [routeTitle, pageTitle]);

    // Sroll to heading
    const { hash, pathname } = useLocation(); // Get hash and pathname from react-router-dom
    const [isContentLoaded, setIsContentLoaded] = useState(false); // Track content loading
    
    useEffect(() => {
        // Use a unique key for hasScrolledToHash based on the current pathname and hash
        const scrollKey = `hasScrolledToHash_${pathname}${hash}`;
        const hasScrolled = sessionStorage.getItem(scrollKey) === 'true';

        /*
        console.log('Scroll useEffect ran:', {
            hash,
            pathname,
            scrollKey,
            hasScrolled,
            isContentLoaded,
        });
        */

        if (hash && !hasScrolled && isContentLoaded) {
            // Wait for DOM to render dynamic HTML
            setTimeout(() => {
                const currentHasScrolled = sessionStorage.getItem(scrollKey) === 'true';
                if (currentHasScrolled) {
                    console.log('Scroll aborted: Flag already set for', scrollKey);
                    return;
                }
                
                const target = document.getElementById(hash.slice(1)); // Remove # from hash
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    sessionStorage.setItem(scrollKey, 'true');
                    console.log('Scrolled to section:', hash, isContentLoaded, sessionStorage.getItem(scrollKey));
                }
            }, 0);
        }

        // Instead of clearing the flag (since wiki dont re scroll), save the position of the screen so the user can look at the same place
        // before navigate away
    }, [pathname, hash, isContentLoaded]);
    //--------------------------------

    const fecthPageContent = async (pageTitle) => {
        try {
            // Clear previous content before fetching new one
            setPageContent(null);

            console.log("Getting content for page with title: " + pageTitle);
            const pageDTO = await getPageContentByTitle(pageTitle);

            setPageContent(pageDTO.pageRevisionDTO.content);
            // Dont need get the page title from pageDTO since the correct page title will result in a page
            setIsContentLoaded(true); // Mark content as loaded
            setLoading(false);
        } catch (error) {
            console.log(error.message);
            setIsContentLoaded(true);
            setLoading(false);
        }
    }
    
    return (
        <div className="wiki-container">
            <Header/>
            <div className="subheader">
                <Link to={`/pages/${encodeURIComponent(pageTitle)}`} className="subheader-link active">Page</Link>
                <Link to={`/edit-source/${encodeURIComponent(pageTitle)}`} className="subheader-link">Edit source</Link>
            </div>
            <div className="page-content">
                {loading ? (
                <p>Loading user page...</p>
                ) : pageContent ? (
                    <>
                        <h1 className='username-heading'>{pageTitle}</h1>
                        <div className="display-page preview-content preview-reset" dangerouslySetInnerHTML={{ __html: pageContent }}></div>
                    </> 
                ) : (
                    /* 
                        This will be displayed if a page for page title provided cannot be found in the database 
                    */
                    <>
                        <h1 className='username-heading'>{pageTitle}</h1>
                        <p>
                        There is currently no text in this page. You can search for this page title in other pages, search the related logs, or create this page. 
                        </p>
                    </>

                )}

            </div>
        </div>
    )
}

export default WikiPage;