import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';
import type { Tag } from './healthLogService';

const TAGS_CACHE_KEY = 'everpal_tags_cache';
const TAGS_CACHE_TIMESTAMP_KEY = 'everpal_tags_cache_timestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export const getTags = async (): Promise<Tag[]> => {
  // Check cache first
  const cachedTimestamp = localStorage.getItem(TAGS_CACHE_TIMESTAMP_KEY);
  const cachedTags = localStorage.getItem(TAGS_CACHE_KEY);

  if (cachedTimestamp && cachedTags) {
    const cacheAge = Date.now() - parseInt(cachedTimestamp, 10);
    if (cacheAge < CACHE_DURATION_MS) {
      return JSON.parse(cachedTags);
    }
  }

  // Fetch from API
  const tags = await apiClient.fetch<Tag[]>(`${API_BASE_URL}/tags`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Cache the result
  localStorage.setItem(TAGS_CACHE_KEY, JSON.stringify(tags));
  localStorage.setItem(TAGS_CACHE_TIMESTAMP_KEY, Date.now().toString());

  return tags;
};

export const clearTagsCache = (): void => {
  localStorage.removeItem(TAGS_CACHE_KEY);
  localStorage.removeItem(TAGS_CACHE_TIMESTAMP_KEY);
};
