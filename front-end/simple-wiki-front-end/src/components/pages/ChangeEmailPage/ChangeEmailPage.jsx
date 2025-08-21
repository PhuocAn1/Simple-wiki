import VerifyID from '../../common/VerifyID/VerifyID';
import Header from '../../common/Header/Header';
import { useState, useEffect } from 'react';
import styles from './ChangeEmailPage.module.css'
import { getUser, updateUser } from '../../services/UserService';

const ChangeEmailPage = () => {
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("User");
    const [currentEmail, setCurrentEmail] = useState("none");
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        const verified = sessionStorage.getItem('isVerified') === 'true';
        setIsVerified(verified);
        setError(null);
        setNewEmail('');
    }, []);

    useEffect(() => {
        return () => {
            sessionStorage.removeItem('isVerified'); // This will clear the flag
            setError(null);
            setNewEmail('');
        };
    }, []);

    const fetchUserData = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError("User ID not found in local storage.");
            return;
        }

        try {
            const user = await getUser(userId);
            setUsername(user.username || "Unknown");
            setCurrentEmail(user.email || "none");
        } catch (err) {
            console.error("Failed to fetch user:", err);
            setError("Failed to load user data.");
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);


    const handleInputChange = (e) => {
        setNewEmail(e.target.value);
    }

    const handleSubmit = async () => {
        try {
            await updateUser(null, null, newEmail);
            await fetchUserData(); // Refresh the info
            setNewEmail('') // Clear the new email input field
            // May be redirect back to my-info page after changing email?
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        }
    }

    return (
        <div className="wiki-container">
            <Header/>
            {!isVerified ? (
                <VerifyID onSuccess={() => setIsVerified(true)} />
            ) : (
                <div className={`page-content ${styles.pageSpecific}`}>
                    {error && <div className="error-message">{error}</div>}
                    <h2>Change or remove email address</h2>
                    <p>Complete this form to change your email address. If you would like to remove the association of 
                        any email address from your account,
                        leave the new email address blank when submitting the form.
                    </p>

                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Current email address:</strong> {currentEmail}</p>

                    <p><strong>New email address</strong></p>
                    <input
                        className={styles.emailInput}
                        value={newEmail}
                        onChange={handleInputChange}
                    />
                    <p>This field should be left blank if you want to remove your email address. You will not be able to reset a forgotten password and will not receive emails from this wiki if the email address is removed.</p>
                    <button className={styles.button} onClick={handleSubmit}>Change email</button>
                </div>
            )}
        </div>
    );
}

export default ChangeEmailPage;