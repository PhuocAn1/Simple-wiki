import axios from "axios";
import API_BASE_URL from "../config";

export const renderWikiText = async (wikiText) => {
    try {
        console.log("Interpreting:\n" + wikiText);
        const payload = {
            wikiText
        }

        const response = await axios.post(`${API_BASE_URL}/wiki-markup/render`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

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

        // Return the html interpreted from wiki text
        return apiResponse.data
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
            } else if (error.response.status === 401) {
                throw new Error(apiResponse.errorMessage || 'Username or password is incorrect');
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
