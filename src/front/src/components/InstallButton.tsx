import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import { Download } from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Manual install button for PWA
 * Shows when browser supports installation but doesn't automatically show prompt
 */
const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();

      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);

      console.log('[Install] Install prompt available');
    };

    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (already installed)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[Install] App is already installed');
        setShowButton(false);
        return true;
      }

      // Check if running as installed PWA
      if ((window.navigator as any).standalone === true) {
        console.log('[Install] App is already installed (iOS)');
        setShowButton(false);
        return true;
      }

      return false;
    };

    if (!checkIfInstalled()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('[Install] App was installed');
      setShowButton(false);
      setShowSuccess(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('[Install] No install prompt available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('[Install] User accepted the install prompt');
    } else {
      console.log('[Install] User dismissed the install prompt');
    }

    // Clear the saved prompt since it can only be used once
    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) {
    return (
      <>
        {/* Success notification */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={6000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowSuccess(false)}>
            App installed successfully! Check your home screen.
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<Download />}
        onClick={handleInstallClick}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
          boxShadow: 3,
          bgcolor: 'background.paper',
          '&:hover': {
            boxShadow: 6,
          },
        }}
      >
        Install App
      </Button>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          App installed successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default InstallButton;
