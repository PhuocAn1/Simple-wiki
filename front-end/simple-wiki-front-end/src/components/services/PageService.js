import axios from "axios";
import API_BASE_URL from "../config";
import { getStoredItem } from "../context/AuthContext";

export const suggestPageTitle = async (pageTitle) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/pages/search?query=${pageTitle}`);

        const apiResponse = response.data;
        console.log('API Response:', {
            status: apiResponse.status,
            data: apiResponse.data,
            errorMessage: apiResponse.errorMessage,
            timestamp: apiResponse.timestamp
        });

        // Check if the response indicates an error (non-2xx status or errorMessage present)
        if (apiResponse.status >= 400 || apiResponse.errorMessage) {
            throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${apiResponse.status}`);
        }

        // Return the list of suggested title in the apiResponse.data
        return apiResponse.data;
    } catch (error) {
        if (error.response) {
            // Server responded with a status code outside 2xx
            const apiResponse = error.response.data;
            console.log('Error API Response:', {
                status: apiResponse.status,
                errorMessage: apiResponse.errorMessage,
                timestamp: apiResponse.timestamp
            });

            if (error.response.status === 400) {
                throw new Error(apiResponse.errorMessage || 'Invalid input data');
            } else if (error.response.status === 409) {
                throw new Error(apiResponse.errorMessage || 'Username or email already exists');
            } else if (error.response.status === 500) {
                throw new Error(apiResponse.errorMessage || 'Server error occurred');
            } else {
                throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${error.response.status}`);
            }   
        } else if (error.request) {
            // No response received
            console.error('No response from server');
            throw new Error('No response from server');
        } else {
            // Error setting up the request
            console.error('Error setting up request:', error.message);
            throw new Error('Error: ' + error.message);
        }
    }
}

export const getRawWikitextContentByTitle = async (pageTitle) => {
    try {
        // This method get the raw wikitext from the server raw endpoint

        const response = await axios.get(`${API_BASE_URL}/pages/raw/${pageTitle}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const apiResponse = response.data;
        // The content for a page should be returned here
        console.log('API Response:', {
            status: apiResponse.status,
            data: apiResponse.data,
            errorMessage: apiResponse.errorMessage,
            timestamp: apiResponse.timestamp
        });

        // Check if the response indicates an error (non-2xx status or errorMessage present)
        if (apiResponse.status >= 400 || apiResponse.errorMessage) {
            throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${apiResponse.status}`);
        }
        
       // Extract PageDTO from the response
        const pageDTO = apiResponse.data;

        // Return the PageDTO or just the revision content if that's the primary need
        // Here, we return the full PageDTO for flexibility
        return pageDTO;
    } catch (error) {
        if (error.response) {
            // Server responded with a status code outside 2xx
            const apiResponse = error.response.data;
            console.log('Error API Response:', {
                status: apiResponse.status,
                errorMessage: apiResponse.errorMessage,
                timestamp: apiResponse.timestamp
            });

            if (error.response.status === 400) {
                throw new Error(apiResponse.errorMessage || 'Invalid input data');
            } else if (error.response.status === 409) {
                throw new Error(apiResponse.errorMessage || 'Username or email already exists');
            } else if (error.response.status === 500) {
                throw new Error(apiResponse.errorMessage || 'Server error occurred');
            } else {
                throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${error.response.status}`);
            }   
        } else if (error.request) {
            // No response received
            console.error('No response from server');
            throw new Error('No response from server');
        } else {
            // Error setting up the request
            console.error('Error setting up request:', error.message);
            throw new Error('Error: ' + error.message);
        }
    }
}

export const getPageContentByTitle = async (pageTitle) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/pages/${pageTitle}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const apiResponse = response.data;
        // The content for a page should be returned here
        console.log('API Response:', {
            status: apiResponse.status,
            data: apiResponse.data,
            errorMessage: apiResponse.errorMessage,
            timestamp: apiResponse.timestamp
        });

        // Check if the response indicates an error (non-2xx status or errorMessage present)
        if (apiResponse.status >= 400 || apiResponse.errorMessage) {
            throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${apiResponse.status}`);
        }
        
       // Extract PageDTO from the response
        const pageDTO = apiResponse.data;

        // Return the PageDTO or just the revision content if that's the primary need
        // Here, we return the full PageDTO for flexibility
        return pageDTO;
    } catch (error) {
        if (error.response) {
            // Server responded with a status code outside 2xx
            const apiResponse = error.response.data;
            console.log('Error API Response:', {
                status: apiResponse.status,
                errorMessage: apiResponse.errorMessage,
                timestamp: apiResponse.timestamp
            });

            if (error.response.status === 400) {
                throw new Error(apiResponse.errorMessage || 'Invalid input data');
            } else if (error.response.status === 409) {
                throw new Error(apiResponse.errorMessage || 'Username or email already exists');
            } else if (error.response.status === 500) {
                throw new Error(apiResponse.errorMessage || 'Server error occurred');
            } else {
                throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${error.response.status}`);
            }   
        } else if (error.request) {
            // No response received
            console.error('No response from server');
            throw new Error('No response from server');
        } else {
            // Error setting up the request
            console.error('Error setting up request:', error.message);
            throw new Error('Error: ' + error.message);
        }
    }
}

export const createPage = async (pageDTO) => {
    try {
        const token = getStoredItem('jwtToken');
        console.log(pageDTO);

        const response = await axios.post(`${API_BASE_URL}/pages`, pageDTO, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const apiResponse = response.data;
        // The content for a page should be returned here
        console.log('API Response:', {
            status: apiResponse.status,
            data: apiResponse.data,
            errorMessage: apiResponse.errorMessage,
            timestamp: apiResponse.timestamp
        });

        // Check if the response indicates an error (non-2xx status or errorMessage present)
        if (apiResponse.status >= 400 || apiResponse.errorMessage) {
            throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${apiResponse.status}`);
        }

        return apiResponse.data;
    } catch (error) {
        if (error.response) {
            // Server responded with a status code outside 2xx
            const apiResponse = error.response.data;
            console.log('Error API Response:', {
                status: apiResponse.status,
                errorMessage: apiResponse.errorMessage,
                timestamp: apiResponse.timestamp
            });

            if (error.response.status === 400) {
                throw new Error(apiResponse.errorMessage || 'Invalid input data');
            } else if (error.response.status === 409) {
                throw new Error(apiResponse.errorMessage || 'Username or email already exists');
            } else if (error.response.status === 500) {
                throw new Error(apiResponse.errorMessage || 'Server error occurred');
            } else {
                throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${error.response.status}`);
            }   
        } else if (error.request) {
            // No response received
            console.error('No response from server');
            throw new Error('No response from server');
        } else {
            // Error setting up the request
            console.error('Error setting up request:', error.message);
            throw new Error('Error: ' + error.message);
        }
    }
}

export const updatePage = async (pageDTO, pageTitle) => {
    try {
        const token = getStoredItem('jwtToken');
        console.log(pageDTO);

        const response = await axios.put(`${API_BASE_URL}/pages/${pageTitle}`, pageDTO, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const apiResponse = response.data;
        // The content for a page should be returned here
        console.log('API Response:', {
            status: apiResponse.status,
            data: apiResponse.data,
            errorMessage: apiResponse.errorMessage,
            timestamp: apiResponse.timestamp
        });

        // Check if the response indicates an error (non-2xx status or errorMessage present)
        if (apiResponse.status >= 400 || apiResponse.errorMessage) {
            throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${apiResponse.status}`);
        }

        return apiResponse.data;
    } catch (error) {
        if (error.response) {
            // Server responded with a status code outside 2xx
            const apiResponse = error.response.data;
            console.log('Error API Response:', {
                status: apiResponse.status,
                errorMessage: apiResponse.errorMessage,
                timestamp: apiResponse.timestamp
            });

            if (error.response.status === 400) {
                throw new Error(apiResponse.errorMessage || 'Invalid input data');
            } else if (error.response.status === 409) {
                throw new Error(apiResponse.errorMessage || 'Username or email already exists');
            } else if (error.response.status === 500) {
                throw new Error(apiResponse.errorMessage || 'Server error occurred');
            } else {
                throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${error.response.status}`);
            }   
        } else if (error.request) {
            // No response received
            console.error('No response from server');
            throw new Error('No response from server');
        } else {
            // Error setting up the request
            console.error('Error setting up request:', error.message);
            throw new Error('Error: ' + error.message);
        }
    }
}