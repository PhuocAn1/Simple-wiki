import React, { useState } from 'react';
import './CreateAccountPage.css';
import Header from '../../common/Header/Header';
import { CreateUser } from '../../services/UserService';

const CreateAccountPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add account creation logic here
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const user = await CreateUser(formData.username, formData.password, formData.email);
      setSuccess('Account created successfully!');
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        email: null
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wiki-container">
      
      <Header/>

      <div className="create-account-container">
        <h2>Create account</h2>
        {error && <div className="error-message mb-4">{error}</div>}
        {success && <div className="success-message mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="create-account-form">
          <div className="form-group">
            <label htmlFor="username">Username <span className="policy-link">(username policy)</span></label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />
            <p className="hint">Your username is public and cannot be made private later.</p>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter a password"
              required
            />
            <p className="hint">It is recommended to use a unique password that you are not using on any other website.</p>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Enter password again"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address (recommended)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
            />
            <p className="hint">Email is required to recover your account if you lose your password or log in from an unfamiliar location or new browser.</p>
          </div>
          <button type="submit" className="submit-button">{loading ? 'Creating...' : 'Create account'}</button>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountPage;