import { Paper, Typography, Button, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Security, CheckCircle } from '@mui/icons-material';

interface SecurityPromptCardProps {
  onSetUpEmail: () => void;
  onSkip: () => void;
}

const SecurityPromptCard = ({ onSetUpEmail, onSkip }: SecurityPromptCardProps) => {
  return (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #2D2D2D 0%, #3A3A3A 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, #F9F7F4 100%)',
        border: (theme) => `2px solid ${theme.palette.primary.light}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Security color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Protect Your Access
        </Typography>
      </Box>

      <Typography color="text.secondary" sx={{ mb: 2 }}>
        You just invested $79 in lifetime access. Secure it with email login:
      </Typography>

      <List dense sx={{ mb: 2 }}>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CheckCircle fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Sign in from any device" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CheckCircle fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Never lose your data" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItem>
        <ListItem disableGutters>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <CheckCircle fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Takes just 30 seconds" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItem>
      </List>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button variant="contained" onClick={onSetUpEmail} fullWidth>
          Set Up Email
        </Button>
        <Button variant="outlined" onClick={onSkip} fullWidth>
          Skip for Now
        </Button>
      </Box>
    </Paper>
  );
};

export default SecurityPromptCard;
