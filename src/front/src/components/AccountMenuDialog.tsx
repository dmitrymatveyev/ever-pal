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
import { Close, Security, Email, Logout, ContactSupport, CheckCircle } from '@mui/icons-material';

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
            Account
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
                primary="Secure Your Account"
                secondary="Set up email login to protect your data"
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
                          Verified
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="warning.main">
                        Not verified
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
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          )}

          <ListItemButton onClick={handleContactSupport} sx={{ borderRadius: 2 }}>
            <ListItemIcon>
              <ContactSupport />
            </ListItemIcon>
            <ListItemText primary="Contact Support" secondary="support@everpal.app" />
          </ListItemButton>
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default AccountMenuDialog;
