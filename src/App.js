import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Switch to HashRouter
import supabase from './supabase';
import './App.css';

// Dashboard component
const Dashboard = ({ logout }) => (
  <div className="app-container">
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Menu</h3>
        <ul>
          <li>Home</li>
          <li>Profile</li>
          <li>Settings</li>
          <li>Messages</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1>Dashboard</h1>
        <p>Welcome to your personalized Dashboard!</p>

        {/* User Info */}
        <div className="user-info">
          <h2>Hello, meowmwoq</h2>
          <p>Account Status: Active</p>
        </div>

        {/* Statistics Section */}
        <div className="stats-container">
          <div className="stat-item">
            <h3>Total Orders</h3>
            <p>1,234</p>
          </div>
          <div className="stat-item">
            <h3>Pending Tasks</h3>
            <p>5</p>
          </div>
          <div className="stat-item">
            <h3>Messages</h3>
            <p>12 new messages</p>
          </div>
        </div>

        {/* Graph/Chart (placeholder for now) */}
        <div className="chart-container">
          <h3>Activity Overview</h3>
          <div className="chart-placeholder">
            {/* Imagine a chart here */}
            <p>Graph would be displayed here</p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="logout-section">
          <button onClick={logout} className="btn">Logout</button>
        </div>
      </div>
    </div>
  </div>
);

// Login component
const Login = ({
  email,
  setEmail,
  password,
  setPassword,
  signInWithEmail,
  signInWithEmailOtp,
  message,
  captchaInput,
  setCaptchaInput,
  captchaText,
  generateCaptcha,
  isLocalhost
}) => (
  <div className="app-container">
    <div className="auth-container">
      <h1>SUPPPPAA NIQQAAAAAA</h1>

      <div className="auth-columns">
        {/* Left Section: Sign In with Email and Password */}
        <div className="auth-box">
          <h2>Sign In with Email and Password</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-field"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field"
          />

          {isLocalhost && (
            <div className="captcha-box">
              <label>Enter CAPTCHA:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="CAPTCHA"
                  className="input-field"
                />
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{captchaText}</span>
                <button type="button" className="btn btn-secondary" onClick={generateCaptcha}>
                  Refresh
                </button>
              </div>
            </div>
          )}

          <button onClick={signInWithEmail} className="btn">Sign In with Password</button>
        </div>

        {/* Right Section: Sign In with Email OTP */}
        <div className="auth-box">
          <h2>Sign In with Email OTP</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-field"
          />

          {isLocalhost && (
            <div className="captcha-box">
              <label>Enter CAPTCHA:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="CAPTCHA"
                  className="input-field"
                />
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{captchaText}</span>
                <button type="button" className="btn btn-secondary" onClick={generateCaptcha}>
                  Refresh
                </button>
              </div>
            </div>
          )}

          <button onClick={signInWithEmailOtp} className="btn">Send OTP to Email</button>
        </div>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  </div>
);

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setIsAuthenticated(true);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    if (isLocalhost) {
      generateCaptcha();
    }

    return () => listener?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const checkForOtpConfirmation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const otpToken = urlParams.get('access_token');
      if (otpToken) {
        const { data, error } = await supabase.auth.setSession(otpToken);
        if (error) {
          setMessage('Failed to verify OTP: ' + error.message);
        } else {
          setIsAuthenticated(true);
        }
      }
    };

    checkForOtpConfirmation();
  }, []);

  const generateCaptcha = () => {
    const newCaptcha = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCaptchaText(newCaptcha);
    setCaptchaInput('');
  };

  const validateCaptcha = () => {
    if (isLocalhost && captchaInput !== captchaText) {
      setMessage('Incorrect CAPTCHA. Please try again.');
      generateCaptcha();
      return false;
    }
    return true;
  };

  const signInWithEmail = async () => {
    if (!validateCaptcha()) return;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage('Error signing in: ' + error.message);
    } else {
      setMessage('Signed in successfully!');
      setIsAuthenticated(true);
    }
  };

  const signInWithEmailOtp = async () => {
    if (!validateCaptcha()) return;

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setMessage('Error sending OTP: ' + error.message);
    } else {
      setMessage('Check your email for the OTP to log in.');
    }
  };

  const logout = async () => {
    // Clear login state
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail(''); // Clear email
    setPassword(''); // Clear password
    setCaptchaInput(''); // Clear CAPTCHA input
    setMessage(''); // Clear any message

    // Redirect to login page
    window.location.href = '/'; // Or use Navigate from react-router to redirect
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                signInWithEmail={signInWithEmail}
                signInWithEmailOtp={signInWithEmailOtp}
                message={message}
                captchaInput={captchaInput}
                setCaptchaInput={setCaptchaInput}
                captchaText={captchaText}
                generateCaptcha={generateCaptcha}
                isLocalhost={isLocalhost}
              />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard logout={logout} /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;