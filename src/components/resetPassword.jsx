import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { TbPasswordUser } from "react-icons/tb";
import './css/forgotPassword.css'; // Reuse the same CSS

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    token: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Get token and email from URL parameters
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (!token || !email) {
      setMessage('Invalid password reset link. Please request a new one.');
      setStatus('error');
      return;
    }

    // Validate token from localStorage
    const storedTokenData = localStorage.getItem(`reset_token_${token}`);
    if (!storedTokenData) {
      setMessage('Invalid or expired password reset link. Please request a new one.');
      setStatus('error');
      return;
    }

    const tokenData = JSON.parse(storedTokenData);
    if (tokenData.expires < Date.now()) {
      setMessage('Password reset link has expired. Please request a new one.');
      setStatus('error');
      localStorage.removeItem(`reset_token_${token}`);
      return;
    }

    if (tokenData.email !== email) {
      setMessage('Invalid password reset link. Please request a new one.');
      setStatus('error');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      token: token,
      email: email
    }));
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setStatus(null);

    // Validate passwords match
    if (formData.password !== formData.password_confirmation) {
      setMessage('Passwords do not match.');
      setStatus('error');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      setStatus('error');
      setLoading(false);
      return;
    }

    try {
      // Validate token exists in localStorage
      const storedTokenData = localStorage.getItem(`reset_token_${formData.token}`);
      if (!storedTokenData) {
        throw new Error('Invalid token');
      }

      // Call backend API to update password
      const response = await axios.post('/api/reset-password-with-token', {
        token: formData.token,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      // Clean up the token from localStorage
      localStorage.removeItem(`reset_token_${formData.token}`);
      
      setMessage('Password has been reset successfully! Redirecting to login...');
      setStatus('success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage(error.response?.data?.message || 'Error resetting password. Please try again.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!formData.token || !formData.email) {
    return (
      <div className="forgot-password-container">
        <h2>Invalid Reset Link</h2>
        <p className="message error">
          This password reset link is invalid or has expired. 
          Please request a new password reset link.
        </p>
        <Link to="/forgot-password" className="submit-button" style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center', marginTop: '20px' }}>
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <h2>Reset Password</h2>
      <p>Enter your new password for: <strong>{formData.email}</strong></p>
      
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter new password"
            required
            className="input-email"
            style={{ paddingRight: "40px" }}
            minLength={8}
          />
          <TbPasswordUser
            style={{
              position: "absolute",
              height: "20px",
              width: "20px",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666"
            }}
          />
        </div>
        
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleInputChange}
            placeholder="Confirm new password"
            required
            className="input-email"
            style={{ paddingRight: "40px" }}
            minLength={8}
          />
          <TbPasswordUser
            style={{
              position: "absolute",
              height: "20px",
              width: "20px",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#666"
            }}
          />
        </div>
        
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      
      {message && <p className={`message ${status}`}>{message}</p>}
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default ResetPassword;