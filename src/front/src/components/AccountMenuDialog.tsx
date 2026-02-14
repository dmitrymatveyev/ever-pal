import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import { Close, Security, Email, Logout, ContactSupport, CheckCircle, Language as LanguageIcon } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';

interface AccountMenuDialogProps {
  open: boolean;
  onClose: () => void;
  isAnonymous: boolean;
  email?: string;
  emailVerified?: boolean;
  onSecureAccount: () => void;
  onSignOut?: () => void;
}

const AccountMenuDialog = ({
  open,
  onClose,
  isAnonymous,
  email,
  emailVerified,
  onSecureAccount,
  onSignOut,
}: AccountMenuDialogProps) => {
  const { t, language, setLanguage } = useLanguage();

  const handleSecureAccount = () => {
    onClose();
    onSecureAccount();
  };

  const handleSignOut = () => {
    onClose();
    onSignOut?.();
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@everpal.app';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {t('account_title')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <List disablePadding>
          {isAnonymous ? (
            <ListItemButton onClick={handleSecureAccount} sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemIcon>
                <Security color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={t('secure_account')}
                secondary={t('secure_account_desc')}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          ) : (
            <ListItem sx={{ borderRadius: 2, mb: 1, bgcolor: 'action.hover' }}>
              <ListItemIcon>
                <Email color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={email}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    {emailVerified ? (
                      <>
                        <CheckCircle sx={{ fontSize: 14 }} color="success" />
                        <Typography variant="caption" color="success.main">
                          {t('verified')}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="warning.main">
                        {t('not_verified')}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          )}

          {!isAnonymous && onSignOut && (
            <ListItemButton onClick={handleSignOut} sx={{ borderRadius: 2, mb: 1 }}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary={t('sign_out')} />
            </ListItemButton>
          )}

          <ListItemButton
            onClick={() => setLanguage(language === 'en' ? 'pl' : 'en')}
            sx={{ borderRadius: 2, mb: 1 }}
          >
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary={t('language_label')} />
          </ListItemButton>

          <ListItemButton onClick={handleContactSupport} sx={{ borderRadius: 2 }}>
            <ListItemIcon>
              <ContactSupport />
            </ListItemIcon>
            <ListItemText primary={t('contact_support')} secondary="support@everpal.app" />
          </ListItemButton>
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default AccountMenuDialog;
