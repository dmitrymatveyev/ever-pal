import { useState, useRef } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';

interface PhotoUploadProps {
  onPhotoChange: (base64: string | null) => void;
  currentPhoto?: string;
}

const PhotoUpload = ({ onPhotoChange, currentPhoto }: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      onPhotoChange(compressed);
    } catch (error) {
      console.error('Failed to compress image:', error);
      alert('Failed to process image. Please try another file.');
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {preview ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
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
              '&:hover': { bgcolor: 'background.paper' },
            }}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<PhotoCamera />}
          onClick={() => fileInputRef.current?.click()}
        >
          Add Photo
        </Button>
      )}
    </Box>
  );
};

export default PhotoUpload;
