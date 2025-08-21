import { useState, useEffect } from 'react';
import VerifyID from '../../common/VerifyID/VerifyID';
import Header from '../../common/Header/Header';
import { updateUser } from '../../services/UserService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ChangePasswordPage = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [password, setPassword] = useState({
        newPassword:'',
        newPasswordRepeat:''
    });
    const [error, setError] = useState(null);
    const {resetAuth} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const verified = sessionStorage.getItem('isVerified') === 'true';
        setIsVerified(verified);
        setError(null);
    }, []);

    useEffect(() => {
        return () => {
            sessionStorage.removeItem('isVerified'); // This will clear the flag
            setError(null);
        };
    }, []);


    const handleInputChange = (e) => {
    const { name, value } = e.target;
        setPassword((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.newPassword !== password.newPasswordRepeat) {
        setError("Passwords do not match.");
        return;
        }

        // TODO: Call backend API to change password
        console.log("Password changed to:", password.newPassword);
        try {
            const apiResponse = await updateUser(null, password.newPassword, null);
            setError(null);

            // Redirect user to the login page and remove the current memo in the context
            // Clear the local storage
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('userId');
            resetAuth(); // Clear the auth memo

            // Navigate to the login page
            navigate('/login');
        } catch (error) {
            setError(error.message || "Failed to update password.");
            return;
        }
        setError(null);
    };

    return (
        <div className="wiki-container">
            <Header/>
            {!isVerified ? (
                <VerifyID onSuccess={() => setIsVerified(true)} />
            ) : (
                <div className="login-container">
                    {error && <div className="error-message">{error}</div>}

                     <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="newPassword">New password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={password.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="Confirm password">Confirm password</label>
                            <input
                                type="password"
                                id="newPasswordRepeat"
                                name="newPasswordRepeat"
                                value={password.newPasswordRepeat}
                                onChange={handleInputChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button type="submit" className="login-button">Change Password</button>
                     </form>

                </div>
            )}

        </div>
    )
}

export default ChangePasswordPage;