import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Box, 
  Paper, 
  Menu, 
  MenuItem, 
  CircularProgress,
  Alert
} from '@mui/material';
import { ExpandMore, ExpandLess, Pets, Logout } from '@mui/icons-material';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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

  const handleTogglePets = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
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

  const handleClose = () => {
    setAnchorEl(null);
    setShowPets(false);
  };

  const handleLogout = () => {
    // Remove user data and redirect to main
    localStorage.removeItem('user');
    navigate('/main');
  };

  if (!userData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to the Main Page
      </Typography>
      
      {userData.isAnonymous ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          You are browsing anonymously
        </Alert>
      ) : (
        <Typography variant="body1" sx={{ mb: 4 }}>
          You are logged in with email: <strong>{userData.email}</strong>
        </Typography>
      )}

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<Pets />}
          endIcon={open ? <ExpandLess /> : <ExpandMore />}
          onClick={handleTogglePets}
          sx={{ mb: 2 }}
        >
          My Pets
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              minWidth: 300,
              maxWidth: 500,
              maxHeight: 400,
            }
          }}
        >
          {loadingPets ? (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : pets.length === 0 ? (
            <MenuItem disabled>
              No pets found. Add your first pet!
            </MenuItem>
          ) : (
            pets.map((pet) => (
              <MenuItem 
                key={pet.id}
                onClick={() => {
                  handleClose();
                  navigate(`/pet/${pet.id}`);
                }}
              >
                {pet.name}
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>

      <Button 
        variant="contained"
        color="error"
        startIcon={<Logout />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  );
};

export default MainPage;