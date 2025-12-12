import { API_BASE_URL } from '../config';

export interface ExportPdfRequest {
  petId: string;
  startDate?: string;
  endDate?: string;
  includePhotos?: boolean;
}

export const exportHealthLogsPdf = async (
  request: ExportPdfRequest,
  token: string,
  isAnonymous: boolean = false
): Promise<Blob> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/healthlogs/export-pdf`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to export PDF');
  }

  return response.blob();
};

export const downloadPdf = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
