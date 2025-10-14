// API Configuration
// Uses environment variable if available, falls back to localhost for development

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001/api';
