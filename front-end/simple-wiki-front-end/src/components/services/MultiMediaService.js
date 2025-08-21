import axios from "axios";
import API_BASE_URL from "../config";
import { getStoredItem } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export const checkFileNames = async(fileNames) => {
    try {
        const token = getStoredItem('jwtToken');

        const response = await axios.post(`${API_BASE_URL}/media/check-filenames`, fileNames, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

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

        // Return a list of duplicate filenames
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

export const getAllMultimedia = async(username) => {
    try {
        const token = getStoredItem('jwtToken');
        const endpoint = username && username.trim() !== ""
        ? `${API_BASE_URL}/media/all/${username}`
        : `${API_BASE_URL}/media/all`;

        const response = await axios.get(endpoint, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const apiResponse = response.data;

        // Check if the response indicates an error (non-2xx status or errorMessage present)
        if (apiResponse.status >= 400 || apiResponse.errorMessage) {
            throw new Error(apiResponse.errorMessage || `HTTP error! Status: ${apiResponse.status}`);
        }

        const multiMediaDTO = apiResponse.data;

        // Return a list of multimedia DTO
        return multiMediaDTO;
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

export const uploadFiles = async(files, fileDescription) => {
    try {
        const fileArray = Array.isArray(files) ? files : [files];

        const token = getStoredItem('jwtToken');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const formData = new FormData();

        for (let file of fileArray) {
            formData.append('files', file);
        }

        formData.append('description', fileDescription);
        formData.append('userId', userId);

        const response = await axios.post(`${API_BASE_URL}/media/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        //return response.data;
        
        // Handle successful response
        const { status, data, errorMessage } = response.data;
        if (status === 200 && !errorMessage) {
            return {
                success: true,
                message: `Successfully uploaded ${data.length} file(s)`,
                files: data // List of file names from the backend
            };
        } else {
            throw new Error(errorMessage || 'Unexpected response from server');
        }
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