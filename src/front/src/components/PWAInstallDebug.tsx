import { useEffect, useState } from 'react';
import { Box, Chip, Typography, Paper } from '@mui/material';

/**
 * Debug component to show PWA installation criteria status
 * This helps diagnose why the install prompt may not be appearing
 *
 * Chrome's Install Criteria:
 * 1. Valid manifest.json with required fields
 * 2. Service worker registered and activated
 * 3. Served over HTTPS (or localhost)
 * 4. User engagement heuristics met (30s interaction OR 2 page navigations)
 * 5. Not already installed as a PWA
 * 6. Not recently dismissed the install prompt
 *
 * Only shown in development mode
 */
const PWAInstallDebug = () => {
  const [checks, setChecks] = useState({
    https: false,
    manifest: false,
    serviceWorker: false,
    swActive: false,
    standalone: false,
    promptReceived: false,
  });

  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const runChecks = async () => {
      // Check HTTPS
      const https = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

      // Check manifest
      let manifest = false;
      try {
        const response = await fetch('/manifest.json');
        manifest = response.ok;
      } catch (e) {
        manifest = false;
      }

      // Check service worker
      const serviceWorker = 'serviceWorker' in navigator;
      let swActive = false;
      if (serviceWorker) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        swActive = registrations.length > 0 && registrations[0].active !== null;
      }

      // Check if already installed
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

      setChecks({
        https,
        manifest,
        serviceWorker: serviceWorker,
        swActive,
        standalone,
        promptReceived: false, // Will be updated by event listener
      });

      console.log('🔍 [PWA Debug] Checks complete:', {
        https,
        manifest,
        serviceWorker,
        swActive,
        standalone,
      });
    };

    runChecks();

    // Listen for beforeinstallprompt
    const handlePrompt = () => {
      console.log('🎯 [PWA Debug] beforeinstallprompt event received!');
      setChecks(prev => ({ ...prev, promptReceived: true }));
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);

    // Timer to track user engagement time
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      clearInterval(timer);
    };
  }, []);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const engagementMet = timeElapsed >= 30;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 80,
        left: 16,
        padding: 2,
        maxWidth: 320,
        zIndex: 1300,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" fontWeight="bold" gutterBottom display="block">
        PWA Install Debug
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
        <Chip
          label="HTTPS"
          size="small"
          color={checks.https ? 'success' : 'error'}
          variant="outlined"
        />
        <Chip
          label="Manifest.json"
          size="small"
          color={checks.manifest ? 'success' : 'error'}
          variant="outlined"
        />
        <Chip
          label="Service Worker Registered"
          size="small"
          color={checks.serviceWorker ? 'success' : 'error'}
          variant="outlined"
        />
        <Chip
          label="Service Worker Active"
          size="small"
          color={checks.swActive ? 'success' : 'warning'}
          variant="outlined"
        />
        <Chip
          label={`User Engagement (${timeElapsed}s / 30s)`}
          size="small"
          color={engagementMet ? 'success' : 'default'}
          variant="outlined"
        />
        <Chip
          label="Already Installed"
          size="small"
          color={checks.standalone ? 'warning' : 'success'}
          variant="outlined"
        />
        <Chip
          label="Install Prompt Received"
          size="small"
          color={checks.promptReceived ? 'success' : 'default'}
          variant="outlined"
        />
      </Box>

      <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: 'text.secondary' }}>
        {!engagementMet && 'Waiting for 30s engagement...'}
        {engagementMet && !checks.promptReceived && 'Engagement met. Prompt should appear soon.'}
        {checks.promptReceived && 'Install prompt ready! Check install button.'}
        {checks.standalone && 'App already installed!'}
      </Typography>

      <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: 'text.disabled' }}>
        Debug panel (dev only)
      </Typography>
    </Paper>
  );
};

export default PWAInstallDebug;
