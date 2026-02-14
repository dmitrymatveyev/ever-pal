import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import { createPet, type CreatePetRequest } from '../services/petService';
import { updateUserEmail } from '../services/userService';
import { trackEvent, trackPageView, trackFormInteraction, trackFormSubmit } from '../utils/analytics';
import { enableDemoMode } from '../utils/demoData';
import { useAuth } from '../contexts/AuthContext';
import TrialStartEmailModal from '../components/TrialStartEmailModal';
import { useLanguage } from '../i18n/LanguageContext';

const AddFirstPet = () => {
  const navigate = useNavigate();
  const { user, createAnonymousUser, markEngaged, refetchTrialStatus } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<CreatePetRequest>({
    name: '',
    breed: '',
    age: undefined,
    weight: undefined,
    photoBase64: undefined
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [createdPetName, setCreatedPetName] = useState('');
  const pageLoadTime = useRef<Date>(new Date());

  // Track page view on mount
  useEffect(() => {
    trackPageView('/add-first-pet');
    trackEvent('onboarding_started', { timestamp: new Date().toISOString() });

    // Track time spent on page when user leaves
    return () => {
      const timeSpent = Math.floor((new Date().getTime() - pageLoadTime.current.getTime()) / 1000);
      trackEvent('onboarding_abandoned', {
        timeSpentSeconds: timeSpent,
        petNameFilled: !!formData.name,
        ageFilled: !!formData.age
      });
    };
  }, [formData]);

  const handleChange = (field: keyof CreatePetRequest, value: string) => {
    // Track field interaction (only once per field)
    if (!formData[field]) {
      trackFormInteraction('add_first_pet', field, 'started_filling');
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    trackEvent('add_pet_button_clicked', {
      petNameFilled: !!formData.name,
      ageFilled: !!formData.age
    });

    if (!formData.name.trim()) {
      setError(t('error_pet_name_required'));
      trackFormSubmit('add_first_pet', false, 'validation_failed_no_name');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let userData = user;

      if (!userData) {
        userData = await createAnonymousUser();
      }

      const petData: CreatePetRequest = {
        name: formData.name.trim(),
        breed: undefined,
        age: formData.age || undefined,
        weight: undefined,
        photoBase64: undefined
      };

      await createPet(userData.token, petData, userData.isAnonymous || false);

      markEngaged();
      await refetchTrialStatus();

      trackFormSubmit('add_first_pet', true);
      trackEvent('pet_created_successfully', {
        hasAge: !!petData.age,
        timeSpentSeconds: Math.floor((new Date().getTime() - pageLoadTime.current.getTime()) / 1000)
      });

      // Check if we should show Layer 1 email modal
      const emailModalShown = localStorage.getItem('emailModalLayer1Shown');
      if (!emailModalShown && (!userData.email || userData.email.includes('@anonymous'))) {
        setCreatedPetName(petData.name);
        setShowEmailModal(true);
        localStorage.setItem('emailModalLayer1Shown', 'true');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to create pet:', err);
      setError(t('error_create_pet_failed'));
      trackFormSubmit('add_first_pet', false, 'api_error');
      trackEvent('pet_creation_failed', {
        error: err instanceof Error ? err.message : 'unknown_error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    trackEvent('onboarding_skipped', {
      timestamp: new Date().toISOString(),
      timeSpentSeconds: Math.floor((new Date().getTime() - pageLoadTime.current.getTime()) / 1000)
    });

    // Enable demo mode and navigate to health journal
    enableDemoMode();
    navigate('/');
  };

  const handleEmailSubmit = async (email: string) => {
    if (!user) {
      return;
    }

    await updateUserEmail(user.token, email, user.isAnonymous || false);

    // Update user in localStorage
    const updatedUser = { ...user, email };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    navigate('/');
  };

  const handleEmailModalClose = () => {
    setShowEmailModal(false);
    navigate('/');
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          {t('welcome_title')} 🐾
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          {t('welcome_subtitle')}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          {t('welcome_body')}
        </Typography>
      </Box>

      <Paper sx={{ p: 4, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          {t('tell_us_about_pet')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label={t('pet_name_label')}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onFocus={() => trackFormInteraction('add_first_pet', 'name', 'focused')}
            required
            fullWidth
            disabled={saving}
            autoFocus
          />
          <TextField
            label={t('age_optional_label')}
            placeholder={t('age_placeholder')}
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value)}
            onFocus={() => trackFormInteraction('add_first_pet', 'age', 'focused')}
            inputProps={{ min: 0 }}
            fullWidth
            disabled={saving}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ mt: 2 }}
          >
            {saving ? <CircularProgress size={24} /> : t('add_pet_continue')}
          </Button>

          <Button
            variant="text"
            size="medium"
            onClick={handleSkip}
            disabled={saving}
            sx={{ mt: 1 }}
          >
            {t('skip_browse_demo')}
          </Button>

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {t('just_name_hint')}
          </Typography>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
              {t('already_have_account')}{' '}
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/signin')}
              sx={{ textDecoration: 'none', fontWeight: 600 }}
            >
              {t('sign_in_link')}
            </Link>
          </Box>
        </Box>
      </Paper>

      {/* Layer 1: Email Collection Modal */}
      <TrialStartEmailModal
        open={showEmailModal}
        onClose={handleEmailModalClose}
        onEmailSubmit={handleEmailSubmit}
        petName={createdPetName}
      />
    </Box>
  );
};

export default AddFirstPet;
