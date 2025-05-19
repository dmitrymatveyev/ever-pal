import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  email: string;
}

const MainPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      // If not logged in, redirect to login
      navigate('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      setUserData(user);
    } catch (e) {
      // If invalid data, redirect to login
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Remove user data and redirect to login
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to the Main Page</h1>
      <p>You are logged in with email: {userData.email}</p>
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default MainPage;
