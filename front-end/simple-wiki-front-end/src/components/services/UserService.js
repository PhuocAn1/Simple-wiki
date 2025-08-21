import axios from "axios";
import API_BASE_URL from "../config";
import { getStoredItem } from "../context/AuthContext";

export const suggestUsernames = async(username) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/search?query=${username}`);

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

        // Return the list of suggested name in the apiResponse.data
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

export const getUser = async(userId) => {
    try {
        const token = getStoredItem('jwtToken');

        const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
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

        // Return the user in the apiResponse.data
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

export const updateUser = async(username="", password="", email=null) => {
    try {
        const token = getStoredItem('jwtToken');
        const username = getStoredItem('username')
        const payLoad = {
            username,
            password,
            email
        };

        const response = await axios.put(`${API_BASE_URL}/users/${username}`, payLoad, {
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

        // Return the whole api response
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

export const CreateUser = async(username, password, email) => {
    try {
        const payLoad = {
            username,
            password,
            email
        };

        const response = await axios.post(`${API_BASE_URL}/users`, payLoad, {
            headers: {
                'Content-Type': 'application/json'
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

        // Return the created user data if successful
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