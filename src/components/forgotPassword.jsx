import { useState } from 'react';
import emailjs from '@emailjs/browser';
import './css/forgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setStatus(null);

    // Generate a simple reset token (you can make this more secure)
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // EmailJS configuration
    const serviceID = 'service_ss7yaie';
    const templateID = 'template_w8nq5n2';
    const publicKey = 'zx7Xx6cTZxEtdx7Sw';

    const templateParams = {
      to_email: email,
      to_name: email.split('@')[0], // Use email prefix as name
      reset_link: resetLink,
      from_name: 'Receptorijum'
    };

    try {
      await emailjs.send(serviceID, templateID, templateParams, publicKey);
      setMessage('Password reset link has been sent to your email!');
      setStatus('success');
      
      // Store the token temporarily (in a real app, store this securely on backend)
      localStorage.setItem(`reset_token_${resetToken}`, JSON.stringify({
        email: email,
        timestamp: Date.now(),
        expires: Date.now() + (60 * 60 * 1000) // 1 hour
      }));
      
    } catch (error) {
      console.error('EmailJS error:', error);
      setMessage('Error sending reset link. Please try again.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="input-email"
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      {message && <p className={`message ${status}`}>{message}</p>}
    </div>
  );
}

export default ForgotPassword;
