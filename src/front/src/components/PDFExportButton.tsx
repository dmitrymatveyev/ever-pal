import { useState } from 'react';
import { Button } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import ExportVetPDFDialog from './ExportVetPDFDialog';

interface PDFExportButtonProps {
  petId: string;
  petName: string;
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const PDFExportButton = ({
  petId,
  petName,
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
}: PDFExportButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={<PictureAsPdf />}
        onClick={() => setDialogOpen(true)}
      >
        Share with Vet
      </Button>
      <ExportVetPDFDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        petId={petId}
        petName={petName}
      />
    </>
  );
};

export default PDFExportButton;
