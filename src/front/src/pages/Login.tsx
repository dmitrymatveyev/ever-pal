import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main page - using only anonymous auth for now
    navigate('/main');
  }, [navigate]);

  return (
    <div>
      <h1>Redirecting to anonymous session...</h1>
    </div>
  );
};

export default Login;
