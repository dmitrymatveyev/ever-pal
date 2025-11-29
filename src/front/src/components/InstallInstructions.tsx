import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
} from '@mui/material';
import { Apple, Android, DesktopWindows } from '@mui/icons-material';

interface InstallInstructionsProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Platform-specific installation instructions dialog
 * Shows different instructions based on the user's device/browser
 */
const InstallInstructions = ({ open, onClose }: InstallInstructionsProps) => {
  // Detect platform
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // iOS Safari Instructions
  if (isIOS || isSafari) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Apple />
          Install EverPal on iOS
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Follow these steps to add EverPal to your home screen:
          </Typography>

          <Stepper orientation="vertical" sx={{ mt: 2 }}>
            <Step active>
              <StepLabel>
                <Typography variant="body2" fontWeight={600}>
                  Tap the Share button
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  Look for the share icon (square with arrow pointing up) at the bottom of Safari
                </Typography>
              </StepContent>
            </Step>

            <Step active>
              <StepLabel>
                <Typography variant="body2" fontWeight={600}>
                  Scroll and tap "Add to Home Screen"
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  You may need to scroll down in the share menu to find this option
                </Typography>
              </StepContent>
            </Step>

            <Step active>
              <StepLabel>
                <Typography variant="body2" fontWeight={600}>
                  Tap "Add"
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  EverPal will appear on your home screen like a native app
                </Typography>
              </StepContent>
            </Step>
          </Stepper>

          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              <strong>Note:</strong> You must use Safari browser on iOS. The install option is not available in Chrome or other browsers on iOS.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Android Chrome Instructions
  if (isAndroid) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Android />
          Install EverPal on Android
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Follow these steps to install EverPal as an app:
          </Typography>

          <Stepper orientation="vertical" sx={{ mt: 2 }}>
            <Step active>
              <StepLabel>
                <Typography variant="body2" fontWeight={600}>
                  Tap the menu (three dots)
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  Located at the top-right corner of Chrome
                </Typography>
              </StepContent>
            </Step>

            <Step active>
              <StepLabel>
                <Typography variant="body2" fontWeight={600}>
                  Tap "Add to Home screen" or "Install app"
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  You may see either option depending on your Chrome version
                </Typography>
              </StepContent>
            </Step>

            <Step active>
              <StepLabel>
                <Typography variant="body2" fontWeight={600}>
                  Tap "Install" or "Add"
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary">
                  EverPal will appear on your home screen and app drawer
                </Typography>
              </StepContent>
            </Step>
          </Stepper>

          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              <strong>Tip:</strong> Once installed, you can find EverPal in your app drawer alongside your other apps.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Desktop (Windows, macOS, Linux) Instructions
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DesktopWindows />
        Install EverPal
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" paragraph>
          Install EverPal as a desktop app for quick access:
        </Typography>

        <Stepper orientation="vertical" sx={{ mt: 2 }}>
          <Step active>
            <StepLabel>
              <Typography variant="body2" fontWeight={600}>
                Look for the install icon in the address bar
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                You should see a small install icon (computer with down arrow) in your browser's address bar
              </Typography>
            </StepContent>
          </Step>

          <Step active>
            <StepLabel>
              <Typography variant="body2" fontWeight={600}>
                Alternatively, open the browser menu
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Click the three dots in the top-right corner and look for "Install EverPal" or "Install app"
              </Typography>
            </StepContent>
          </Step>

          <Step active>
            <StepLabel>
              <Typography variant="body2" fontWeight={600}>
                Click Install
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                This will install EverPal as a desktop application on your computer
              </Typography>
            </StepContent>
          </Step>
        </Stepper>

        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <strong>Supported Browsers:</strong> Chrome, Edge, and other Chromium-based browsers. Safari on macOS also supports installation.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallInstructions;
