import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMainData } from '../services/authService';
import { getPets, type Pet } from '../services/petService';

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
  const [pets, setPets] = useState<Pet[]>([]);
  const [showPets, setShowPets] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

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

  const handleTogglePets = async () => {
    if (!showPets && pets.length === 0 && userData?.token) {
      setLoadingPets(true);
      try {
        const userPets = await getPets(userData.token, userData.isAnonymous);
        setPets(userPets);
      } catch (error) {
        console.error('Failed to fetch pets:', error);
      } finally {
        setLoadingPets(false);
      }
    }
    setShowPets(!showPets);
  };

  const handleLogout = () => {
    // Remove user data and redirect to login
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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

      <div style={{ marginTop: '30px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button 
            onClick={handleTogglePets}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            My Pets
            <span style={{ fontSize: '12px' }}>
              {showPets ? '▲' : '▼'}
            </span>
          </button>

          {showPets && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              minWidth: '300px',
              maxWidth: '500px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 1000,
              marginTop: '5px'
            }}>
              <div style={{ padding: '15px' }}>
                {loadingPets ? (
                  <p style={{ margin: '0' }}>Loading pets...</p>
                ) : pets.length === 0 ? (
                  <p style={{ margin: '0' }}>No pets found. Add your first pet!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {pets.map((pet) => (
                      <div 
                        key={pet.id} 
                        style={{
                          border: '1px solid #eee',
                          borderRadius: '5px',
                          padding: '10px',
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{pet.name}</h4>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {pet.breed && <div><strong>Breed:</strong> {pet.breed}</div>}
                          {pet.age && <div><strong>Age:</strong> {pet.age} years</div>}
                          {pet.weight && <div><strong>Weight:</strong> {pet.weight} kg</div>}
                        </div>
                        {pet.photoUrl && (
                          <img 
                            src={pet.photoUrl} 
                            alt={pet.name}
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              borderRadius: '5px',
                              marginTop: '8px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Logout
        </button>
      </div>
      
      {userData.isAnonymous && (
        <p style={{ marginTop: '20px', fontStyle: 'italic' }}>
          Login functionality temporarily disabled while implementing anonymous auth
        </p>
      )}
    </div>
  );
};

export default MainPage;
