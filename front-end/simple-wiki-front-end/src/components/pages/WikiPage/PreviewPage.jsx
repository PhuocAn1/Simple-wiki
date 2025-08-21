import { useState, useEffect } from "react";

export const PreviewPage = () => {
    // This will render a whole review page similar to a normal page without the header and link to edit source
    const [pageTitle, setPageTitle] = useState('');
    const [pageContent, setPageContent] = useState('');

    // Fetch data from sessionStorage when the component mounts
    useEffect(() => {
        const previewData = JSON.parse(sessionStorage.getItem('previewData') || '{}');
        setPageTitle(previewData.pageTitle || 'Preview');
        setPageContent(previewData.pageContent || '');
        
        // Optional: Clear sessionStorage after retrieving data to avoid stale data
        sessionStorage.removeItem('previewData');
    }, []);

    return (
        <div className="wiki-container">
            <div className="page-content">
                <>
                    <h1 className='username-heading'>{pageTitle}</h1>
                    <div className="display-page preview-content preview-reset" dangerouslySetInnerHTML={{ __html: pageContent }}></div>
                </> 
            </div>
        </div>
    )
}

export default PreviewPage;