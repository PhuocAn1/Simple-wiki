import React, { useState } from "react";
import { verifyID } from "../../services/AuthenticationService";
import { getStoredItem } from "../../context/AuthContext";

const VerifyID = ({ onSuccess }) => {
    const [error, setError] = useState(null);
    const [verifyRequest, setVerifyRequest] = useState({
        username: '',
        password: '',
    });

    const handleInputChange = (e) => {
    const { name, value } = e.target;
        setVerifyRequest((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = getStoredItem('userId');
        try {
            const apiResponse = await verifyID(verifyRequest.username, verifyRequest.password, userId);
            sessionStorage.setItem('isVerified', 'true'); // store flag
            onSuccess(apiResponse); // Notify parent componen, dont need to pass in the api response if not planning to use it
        } catch (error) {
            setError(error.message)
        }
    };

    return (
        <div className="wiki-container">
            <div className="login-container">
                <h2>Verify your identity</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username (Not email)</label>
                        <input 
                            type="text" 
                            id="username"
                            name="username"
                            value={verifyRequest.username}
                            onChange={handleInputChange}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={verifyRequest.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="login-button">Log in</button>
                </form>
            </div>
        </div>
    );
}

export default VerifyID;