import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!email || !password) {
      setError('All fields are required');
      return;
    }
    
    // In a real app, we would validate against an API
    // This is dummy logic imitating API call
    console.log('Logging in with:', { email, password });
    
    // Simulate successful login
    localStorage.setItem('user', JSON.stringify({ email }));
    
    // Redirect to main page after successful login
    navigate('/main');
  };

  return (
    <div>
      <h1>Login</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div>
          <button type="submit">Login</button>
        </div>
      </form>
      
      <p>
        Don't have an account? <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
