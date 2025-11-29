import { useState, useEffect } from 'react';
import { Snackbar, Alert, Tooltip, Fab } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import InstallInstructions from './InstallInstructions';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Manual install button for PWA
 * Shows when browser supports installation but doesn't automatically show prompt
 * Enhanced with debugging, fallback instructions, and better UX
 */
const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    console.log('🔍 [InstallButton] Component mounted, checking install state...');

    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode (already installed)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ [InstallButton] App is already installed (standalone mode)');
        setIsInstalled(true);
        return true;
      }

      // Check if running as installed PWA on iOS
      if ((window.navigator as any).standalone === true) {
        console.log('✅ [InstallButton] App is already installed (iOS standalone)');
        setIsInstalled(true);
        return true;
      }

      console.log('ℹ️  [InstallButton] App is not installed');
      return false;
    };

    if (checkIfInstalled()) {
      return; // Early exit if already installed
    }

    // Check for iOS Safari (different install flow)
    const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) &&
                        !(window.navigator as any).standalone &&
                        !/(CriOS|FxiOS|OPiOS|mercury)/i.test(navigator.userAgent);

    if (isIOSSafari) {
      console.log('📱 [InstallButton] iOS Safari detected - showing manual instructions');
      setIsIOS(true);
      setShowButton(true); // Show button to trigger manual instructions
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('🎯 [InstallButton] beforeinstallprompt event fired!');

      // Prevent the default browser install prompt
      e.preventDefault();

      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('🎉 [InstallButton] App was installed successfully');
      setShowButton(false);
      setShowSuccess(true);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    console.log('👂 [InstallButton] Listening for beforeinstallprompt event...');
    console.log('ℹ️  [InstallButton] Note: Chrome requires user engagement (30s or 2 page navigations) before firing the event');

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // iOS Safari - show manual instructions
    if (isIOS) {
      console.log('📱 [InstallButton] Showing iOS install instructions');
      setShowInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      console.log('⚠️  [InstallButton] No install prompt available - showing manual instructions');
      setShowInstructions(true);
      return;
    }

    try {
      console.log('🚀 [InstallButton] Triggering install prompt...');

      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ [InstallButton] User accepted the install prompt');
      } else {
        console.log('❌ [InstallButton] User dismissed the install prompt');
      }

      // Clear the saved prompt since it can only be used once
      setDeferredPrompt(null);
      setShowButton(false);
    } catch (error) {
      console.error('❌ [InstallButton] Error during install:', error);
      // Show manual instructions as fallback
      setShowInstructions(true);
    }
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return (
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
    );
  }

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
      {/* Floating Action Button for Install */}
      <Tooltip title={isIOS ? 'Install Instructions' : 'Install App'}>
        <Fab
          color="primary"
          size="medium"
          onClick={handleInstallClick}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <GetApp />
        </Fab>
      </Tooltip>

      {/* Install Instructions Dialog */}
      <InstallInstructions
        open={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Success notification */}
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
