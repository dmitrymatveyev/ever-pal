import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPets, type Pet } from '../services/petService';

interface UserData {
  email: string;
  isAnonymous?: boolean;
  token?: string;
}

const MainPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showPets, setShowPets] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

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
    // Remove user data and redirect to main
    localStorage.removeItem('user');
    navigate('/main');
  };

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to the Main Page</h1>
      {userData.isAnonymous ? (
        <p>You are browsing anonymously</p>
      ) : (
        <p>You are logged in with email: {userData.email}</p>
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
              backgroundColor: '#f9f9f9',
              color: '#213547',
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
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {pets.map((pet) => (
                      <div 
                        key={pet.id} 
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #ddd',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        onClick={() => {
                          setShowPets(false);
                          navigate(`/pet/${pet.id}`);
                        }}
                      >
                        {pet.name}
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
    </div>
  );
};

export default MainPage;
