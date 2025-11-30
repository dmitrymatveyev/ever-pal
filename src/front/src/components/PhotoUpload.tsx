import { useState, useRef } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { PhotoCamera, Close, PhotoLibrary } from '@mui/icons-material';

interface PhotoUploadProps {
  onPhotoChange: (base64: string | null) => void;
  currentPhoto?: string;
}

const PhotoUpload = ({ onPhotoChange, currentPhoto }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          const maxWidth = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL('image/jpeg', 0.8);

          // Log compression size for debugging
          const sizeKB = (base64.length * 3) / 4 / 1024;
          console.log(`📸 Image compressed: ${sizeKB.toFixed(0)}KB`);

          resolve(base64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG or PNG)');
      return;
    }

    // Removed 5MB validation - compression handles size reduction
    // Modern camera photos can be 5-10MB but compress to <500KB

    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      onPhotoChange(compressed);
    } catch (error) {
      console.error('Failed to compress image:', error);
      alert('Failed to process image. Please try another file.');
    }

    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleChoosePhoto = () => {
    galleryInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoChange(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  return (
    <Box>
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {preview ? (
        <Box>
          <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
            <IconButton
              onClick={handleRemove}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                },
              }}
              size="small"
            >
              <Close />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Click the × to remove and add a different photo
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={handleTakePhoto}
            size="small"
          >
            Take Photo
          </Button>
          <Button
            variant="outlined"
            startIcon={<PhotoLibrary />}
            onClick={handleChoosePhoto}
            size="small"
          >
            Choose from Gallery
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PhotoUpload;
