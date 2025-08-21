import axios from "axios";
import API_BASE_URL from "../config";
import { getStoredItem } from "../context/AuthContext";

export const logout = () => {
    localStorage.removeItem('jwtToken'); // Clear the token on logout
};

export const getToken = () => {
    return localStorage.getItem('jwtToken');
};

export const verifyID = async (aUsername, aPassword, aUserId) => {
    try {
        const token = getStoredItem('jwtToken');
        const verifyRequest = {
            username: aUsername,
            password: aPassword,
            userId: aUserId
        };

         const response = await axios.post(`${API_BASE_URL}/login/verify`, verifyRequest, {
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

        return apiResponse;
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

export const validateToken = async (token) => {
    try {
        console.log("validating token: " + token);
        const payload = {
            token
        }

        const response = await axios.post(`${API_BASE_URL}/login/validate`, payload, {
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

        // Return the newly refreshed JWT token if authenticate is successful
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

export const authenticate = async (username, password, rememberMe) => {
    // Data in the apiResponse return from authenticate need to be a JWT token
    try {
        const payload = {
            username,
            password,
            rememberMe
        }

        const response = await axios.post(`${API_BASE_URL}/login`, payload, {
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

        // Return the JWT token if authenticate is successful
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