import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!username || !email || !password) {
      setError('All fields are required');
      return;
    }
    
    // In a real app, we would send this data to an API
    // This is dummy logic imitating API call
    console.log('Signing up with:', { username, email, password });
    
    // Simulate successful registration
    localStorage.setItem('registered', JSON.stringify({ username, email }));
    
    // Redirect to login
    navigate('/login');
  };

  return (
    <div>
      <h1>Sign Up</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
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
          <button type="submit">Sign Up</button>
        </div>
      </form>
      
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default SignUp;
