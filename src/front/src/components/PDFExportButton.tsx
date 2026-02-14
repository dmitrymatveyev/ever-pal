import { useState } from 'react';
import { Button } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import ExportVetPDFDialog from './ExportVetPDFDialog';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={<PictureAsPdf />}
        onClick={() => setDialogOpen(true)}
      >
        {t('share_with_vet')}
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
