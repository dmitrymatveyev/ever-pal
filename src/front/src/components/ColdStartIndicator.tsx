import { Snackbar, Alert, LinearProgress, Box, Typography } from '@mui/material';
import { useColdStart } from '../contexts/ColdStartContext';

/**
 * Global indicator that shows when the server is waking up from a cold start
 */
const ColdStartIndicator = () => {
  const { isWakingUp, message } = useColdStart();

  return (
    <Snackbar
      open={isWakingUp}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 2 }}
    >
      <Alert
        severity="info"
        sx={{
          width: '100%',
          boxShadow: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
            {message}
          </Typography>
          <LinearProgress sx={{ borderRadius: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This usually takes 10-15 seconds on first load
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default ColdStartIndicator;
