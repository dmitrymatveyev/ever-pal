import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMainData } from '../services/authService';

interface UserData {
  email: string;
  isAnonymous?: boolean;
  token?: string;
}

interface MainData {
  message: string;
  userId: string;
  email: string;
}

const MainPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mainData, setMainData] = useState<MainData | null>(null);

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

  useEffect(() => {
    const fetchMainData = async (token: string) => {
      try {
        const data = await getMainData(token);
        setMainData(data);
      } catch (error) {
        console.error('Failed to fetch main data:', error);
      }
    };

    if (userData?.token) {
      fetchMainData(userData.token);
    }
  }, [userData?.token]);

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
      {userData.isAnonymous ? (
        <p>You are browsing anonymously</p>
      ) : (
        <p>You are logged in with email: {userData.email}</p>
      )}
      
      {mainData && (
        <div>
          <h2>Main Data:</h2>
          <p>{mainData.message}</p>
          <p>User ID: {mainData.userId}</p>
        </div>
      )}
      
      {userData.isAnonymous && (
        <p>Login functionality temporarily disabled while implementing anonymous auth</p>
      )}
    </div>
  );
};

export default MainPage;
