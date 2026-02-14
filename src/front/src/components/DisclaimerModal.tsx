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
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

const DisclaimerModal = ({ open, onClose }: DisclaimerModalProps) => {
  const { user, refetchTrialStatus } = useAuth();
  const { t } = useLanguage();
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!acknowledged || !user) {
      return;
    }

    try {
      setSubmitting(true);
      await acknowledgeDisclaimer(user.token, user.isAnonymous || false);
      await refetchTrialStatus();
      onClose();
    } catch (error) {
      console.error('Failed to acknowledge disclaimer:', error);
      alert(t('disclaimer_save_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {t('disclaimer_title')}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph>
          <strong>{t('disclaimer_observation_tool')}</strong>
        </Typography>
        <Typography variant="body2" paragraph>
          {t('disclaimer_body')}
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>{t('disclaimer_consult_vet')}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('disclaimer_no_guidance')}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} />
          }
          label={t('disclaimer_checkbox')}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAccept} variant="contained" disabled={!acknowledged || submitting}>
          {t('disclaimer_accept')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisclaimerModal;
