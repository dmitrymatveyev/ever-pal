import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Shows a notification when the app goes offline or comes back online
 */
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineAlert(true);
      setShowOfflineAlert(false);

      // Auto-hide online alert after 3 seconds
      setTimeout(() => {
        setShowOnlineAlert(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
      setShowOnlineAlert(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline alert if starting offline
    if (!navigator.onLine) {
      setShowOfflineAlert(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Offline Alert - Persistent */}
      <Snackbar
        open={showOfflineAlert && !isOnline}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          sx={{ width: '100%' }}
          onClose={() => setShowOfflineAlert(false)}
        >
          You're offline - Some features may be limited
        </Alert>
      </Snackbar>

      {/* Back Online Alert - Auto-dismiss */}
      <Snackbar
        open={showOnlineAlert && isOnline}
        autoHideDuration={3000}
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Back online!
        </Alert>
      </Snackbar>
    </>
  );
};

export default OfflineIndicator;
