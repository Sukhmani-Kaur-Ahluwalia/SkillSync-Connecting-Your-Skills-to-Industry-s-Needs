import React, { useState } from "react";

function Auth({ onLogin, onCreateAccount }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/check-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.exists && result.authenticated) {
          // Student exists and password is correct - login successful
          localStorage.setItem('student', JSON.stringify(result.student));
          localStorage.setItem('studentId', result.student.id);
          onLogin(result.student);
        } else if (result.exists && !result.authenticated) {
          // Email exists but password is wrong
          setError(result.error || 'Invalid password. Please try again.');
        } else {
          // Student does not exist - show message and redirect to account creation
          setMessage(result.message || 'Account not found. Please create your account first.');
          setTimeout(() => {
            onCreateAccount();
          }, 2000); // Redirect after 2 seconds
        }
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Network error. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#D1B4C6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ backgroundColor: '#EFE1E1', padding: '50px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(60, 85, 136, 0.2)', width: '90%', maxWidth: '500px' }}>
        <h1 style={{ color: '#d6989cff', marginBottom: '30px', textAlign: 'center', fontSize: '2.5rem' }}>SkillSync</h1>
        <p style={{ textAlign: 'center', color: '#141515ff', marginBottom: '30px' }}>Login to your account</p>
        
        <form onSubmit={handleLogin}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#141515ff' }}>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color: 'black', background: 'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }}
            disabled={loading}
            required
          />

          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#141515ff' }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '15px', marginBottom: '20px', color: 'black', background: 'white', borderRadius: '8px', border: '1px solid #d5d2d2ff', boxSizing: 'border-box' }}
            disabled={loading}
            required
            minLength={6}
          />

          {error && (
            <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', border: '1px solid #ef5350' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ padding: '15px', marginBottom: '20px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px', border: '1px solid #ffc107' }}>
              {message}
              <div style={{ marginTop: '10px', fontSize: '14px' }}>Redirecting to account creation...</div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '20px',
              marginTop: '10px',
              backgroundColor: loading ? '#999' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #d5d2d2ff' }}>
          <p style={{ color: '#141515ff', marginBottom: '15px' }}>Don't have an account?</p>
          <button
            type="button"
            onClick={onCreateAccount}
            disabled={loading}
            style={{
              padding: '15px 40px',
              backgroundColor: 'transparent',
              color: '#d6989cff',
              border: '2px solid #d6989cff',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#d6989cff';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#d6989cff';
              }
            }}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Auth;
