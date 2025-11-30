import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Box,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { acknowledgeDisclaimer } from '../services/trialService';

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Medical disclaimer modal
 * Must be acknowledged on first launch
 * Required by QA Engineer for legal safety
 */
const DisclaimerModal = ({ open, onClose }: DisclaimerModalProps) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!acknowledged) {
      return;
    }

    try {
      setSubmitting(true);

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user found');
      }

      const userData = JSON.parse(userStr);
      const token = userData.token;
      const isAnonymous = userData.isAnonymous || false;

      if (!token) {
        throw new Error('No token found');
      }

      await acknowledgeDisclaimer(token, isAnonymous);
      onClose();
    } catch (error) {
      console.error('Failed to acknowledge disclaimer:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Important Medical Disclaimer
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          <strong>EverPal is an observation tool, not a veterinary service.</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          This app helps you track and organize your pet's health information. It does not
          diagnose, treat, or provide medical recommendations.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Always consult your veterinarian for medical advice.</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          We do not provide medical guidance, and any patterns or observations shown in this app
          should be discussed with a qualified veterinarian.
        </Typography>

        <FormControlLabel
          control={
            <Checkbox checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
          }
          label="I understand that EverPal is not a substitute for professional veterinary care"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAccept} variant="contained" disabled={!acknowledged || submitting}>
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisclaimerModal;
