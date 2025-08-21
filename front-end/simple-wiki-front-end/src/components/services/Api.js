import axios from 'axios';
import { getToken } from '../utils/utils';
import API_BASE_URL from '../config';

const api = axios.create({
    baseURL: `${API_BASE_URL}`
})

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const apiLogger = async(message) => {
    try {
        const payload = {
            message,
            timeStamp: new Date().toISOString()
        };


        const response = await axios.post(`${API_BASE_URL}/log`, payload, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
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

export default api;