import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './NotificationSettings.css';

export default function NotificationSettings() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedEmail = localStorage.getItem('notificationEmail') || '';
    const savedPhone = localStorage.getItem('notificationPhone') || '';
    setEmail(savedEmail);
    setPhoneNumber(savedPhone);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validate inputs
      if (!email && !phoneNumber) {
        setError('Please enter at least email or phone number');
        setLoading(false);
        return;
      }

      if (email && !isValidEmail(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      if (phoneNumber && !isValidPhone(phoneNumber)) {
        setError('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      // Call API
      await apiClient.putNotificationStatus({
        email: email || null,
        phone_number: phoneNumber || null,
      });

      // Save to localStorage
      localStorage.setItem('notificationEmail', email);
      localStorage.setItem('notificationPhone', phoneNumber);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
      console.error('Error saving notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  return (
    <div className="notification-settings">
      <button 
        className="settings-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        ⚙️ Notification Settings {isExpanded ? '▲' : '▼'}
      </button>

      {isExpanded && (
        <div className="settings-panel">
          <h3>Notification Preferences</h3>
          <p className="settings-description">
            Set your email and phone number to receive price alerts
          </p>

          {error && <div className="settings-error">{error}</div>}
          {success && <div className="settings-success">✓ Settings saved successfully!</div>}

          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                disabled={loading}
              />
              <small>Format: +91 9876543210 or 09876543210</small>
            </div>

            <button
              className="btn-save-settings"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {(email || phoneNumber) && (
            <div className="settings-preview">
              <h4>Current Settings:</h4>
              {email && <p>📧 Email: <strong>{email}</strong></p>}
              {phoneNumber && <p>📱 Phone: <strong>{phoneNumber}</strong></p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
