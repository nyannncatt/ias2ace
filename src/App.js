// App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import supabase from './supabase';
import './App.css';
import './ModalMessage.css'; // for modal styles

const Modal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const Dashboard = ({ logout }) => {
  const [systemInfo, setSystemInfo] = useState({});
  const [runningApps, setRunningApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/system-info');
        if (!response.ok) throw new Error('Failed to fetch system info');
        const data = await response.json();
        setSystemInfo(data.system);
        setRunningApps(data.apps);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error.message);
        console.error('Failed to fetch system info:', error);
      }
    };
    fetchInfo();
  }, []);

  return (
    <div className="app-container">
      <div className="dashboard-container">
        <div className="sidebar">
          <h3>Menu</h3>
          <ul>
            <li>System Info</li>
            <li>Processes</li>
            <li>Settings</li>
          </ul>
        </div>
        <div className="main-content">
          <h1>PC Dashboard</h1>
          {loading && <div>Loading system info...</div>}
          {error && <Modal message={error} onClose={() => setError('')} />}
          {!loading && !error && (
            <>
              <div className="user-info">
                <h2>System Information</h2>
                <p><strong>Platform:</strong> {systemInfo.platform}</p>
                <p><strong>Architecture:</strong> {systemInfo.arch}</p>
                <p><strong>CPU:</strong> {systemInfo.cpu}</p>
                <p><strong>Total Memory:</strong> {systemInfo.totalMem} MB</p>
                <p><strong>Free Memory:</strong> {systemInfo.freeMem} MB</p>
              </div>
              <div className="stats-container">
                <h2>Running Applications</h2>
                <ul>
                  {runningApps.map((app, index) => (
                    <li key={index}>{app}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <div className="logout-section">
            <button onClick={logout} className="btn">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = ({
  email, setEmail,
  password, setPassword,
  signInWithEmail,
  signInWithEmailOtp,
  signUpWithEmail,
  captchaInput, setCaptchaInput,
  captchaText, generateCaptcha,
  isLocalhost,
  resendVerificationEmail,
  isSignUpMode, setIsSignUpMode
}) => (
  <div className="app-container">
    <div className="auth-container">
      <h1>drafted-ias2</h1>
      <div className="auth-box">
        <h2>{isSignUpMode ? 'Sign Up' : 'Sign In'} with Email</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-field" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" />
        {isLocalhost && (
          <div className="captcha-box">
            <label>Enter CAPTCHA:</label>
            <div className="captcha-input">
              <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())} placeholder="CAPTCHA" />
              <span className="captcha-text">{captchaText}</span>
              <button type="button" className="btn btn-secondary" onClick={generateCaptcha}>Refresh</button>
            </div>
          </div>
        )}
        {isSignUpMode ? (
          <button onClick={signUpWithEmail} className="btn">Sign Up</button>
        ) : (
          <>
            <button onClick={signInWithEmail} className="btn">Sign In with Password</button>
            <button onClick={signInWithEmailOtp} className="btn">Send OTP to Email</button>
          </>
        )}
        <button className="btn btn-link" onClick={() => {
          setIsSignUpMode(!isSignUpMode);
          if (isLocalhost) generateCaptcha();
        }}>
          {isSignUpMode ? 'Have an account? Sign In' : 'New here? Sign Up'}
        </button>
        <button className="btn btn-secondary" onClick={resendVerificationEmail}>Resend Verification Email</button>
      </div>
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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setIsAuthenticated(true);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    if (isLocalhost) generateCaptcha();
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
    if (loginAttempts >= 5) {
      setMessage('Too many attempts. Please wait a few minutes.');
      return;
    }
    setLoginAttempts((prev) => prev + 1);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('Error signing in: ' + error.message);
      generateCaptcha();
    } else {
      if (!data.user?.email_confirmed_at) {
        setMessage('Error signing in: Email not confirmed.');
        await supabase.auth.signOut();
        generateCaptcha();
        return;
      }
      setMessage('');
      setIsAuthenticated(true);
    }
  };

  const signInWithEmailOtp = async () => {
    if (!validateCaptcha()) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage('Error sending OTP: ' + error.message);
      generateCaptcha();
    } else {
      setMessage('Check your email for the OTP to log in.');
    }
  };

  const signUpWithEmail = async () => {
    if (!validateCaptcha()) return;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage('Error signing up: ' + error.message);
      generateCaptcha();
    } else {
      setMessage('Signup successful! Please check your email to verify your account.');
    }
  };

  const resendVerificationEmail = async () => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      setMessage('Failed to resend verification email.');
    } else {
      setMessage('Verification email sent. Please check your inbox.');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setCaptchaInput('');
    setMessage('');
    window.location.hash = '/';
  };

  return (
    <Router>
      <Modal message={message} onClose={() => setMessage('')} />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                signInWithEmail={signInWithEmail}
                signInWithEmailOtp={signInWithEmailOtp}
                signUpWithEmail={signUpWithEmail}
                captchaInput={captchaInput} setCaptchaInput={setCaptchaInput}
                captchaText={captchaText} generateCaptcha={generateCaptcha}
                isLocalhost={isLocalhost}
                resendVerificationEmail={resendVerificationEmail}
                isSignUpMode={isSignUpMode} setIsSignUpMode={setIsSignUpMode}
              />
            )
          }
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard logout={logout} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
};

export default App;
