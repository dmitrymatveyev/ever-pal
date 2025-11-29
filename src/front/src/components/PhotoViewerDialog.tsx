import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

interface PhotoViewerDialogProps {
  open: boolean;
  photoUrl: string;
  onClose: () => void;
}

const PhotoViewerDialog: React.FC<PhotoViewerDialogProps> = ({ open, photoUrl, onClose }) => {
  const [zoom, setZoom] = React.useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5)); // Min 0.5x zoom
  };

  const handleClose = () => {
    setZoom(1); // Reset zoom when closing
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          boxShadow: 24,
        }
      }}
    >
      {/* Close and zoom controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          display: 'flex',
          gap: 1,
        }}
      >
        <IconButton
          onClick={handleZoomOut}
          sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}
          disabled={zoom <= 0.5}
        >
          <ZoomOutIcon />
        </IconButton>
        <IconButton
          onClick={handleZoomIn}
          sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}
          disabled={zoom >= 3}
        >
          <ZoomInIcon />
        </IconButton>
        <IconButton
          onClick={handleClose}
          sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Photo content */}
      <DialogContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          minHeight: '60vh',
          overflow: 'auto',
        }}
      >
        <Box
          component="img"
          src={photoUrl}
          alt="Health log photo"
          sx={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease-in-out',
            cursor: zoom > 1 ? 'move' : 'default',
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PhotoViewerDialog;
