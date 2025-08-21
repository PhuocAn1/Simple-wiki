import Header from "../../common/Header/Header"
import { useEffect, useState } from 'react';
import styles from './MyInfoPage.module.css'
import { Link } from 'react-router-dom';
import { getUser } from '../../services/UserService';
import { getStoredItem } from "../../context/AuthContext";

const MyInfoPage = () => {
    const [username, setUsername] = useState("");
    const [registrationTime, setRegistrationTime] = useState("");
    const [email, setEmail] = useState("");

    const fetchUserData = async () => {
        const userId = getStoredItem('userId');
        if (!userId) {
            alert("User ID not found in local storage or session storage.");
            return;
        }
    
        try {
            const user = await getUser(userId);
            setUsername(user.username || "Unknown");
            setEmail(user.email || "");
            setRegistrationTime(user.createdAt);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            alert("Failed to load user data.");
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <div className="wiki-container">
            <Header/>
            <div className={`page-content ${styles.pageSpecific}`}>
                <div>
                    <h2>Basic information</h2>
                    <p><strong>Username:</strong> {username}</p>
                    <p>
                        <strong>Password:</strong> 
                        <Link to="/settings/change-password" className={styles.button}>
                            Change password
                        </Link>

                    </p>
                    <p><strong>Registration time:</strong> {registrationTime}</p>
                </div>
                
                <div>
                    <h2>Email options</h2>
                    
                    {email ? (
                    <div>
                        <p><strong>Email:</strong> {email}</p>
                        <p>
                            <Link to="/settings/change-email" className={`${styles.button} ${styles.noMargin}`}> 
                                Change email 
                            </Link>
                        </p>
                    </div>
                    ) : (
                        <div>
                            <p>
                                <strong>Email:</strong> 
                                <Link to="/settings/change-email" className={styles.button}>
                                    Set an email address
                                </Link>
                            </p>
                            
                            <p>
                                Email address is optional, but is needed for password resets, should you forget your password. 
                                You can also choose to let others contact you by email through a link on your user or talk page. 
                                Your email address is not revealed when other users contact you.
                            </p>
                        </div> 
                    )}
                    
                </div>
            </div>
        </div>
    )
}

export default MyInfoPage;