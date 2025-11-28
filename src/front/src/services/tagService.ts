import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';
import type { Tag } from './healthLogService';

const TAGS_CACHE_PREFIX = 'everpal_tags_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

const getCacheKey = (logType?: string): string => {
  return logType ? `${TAGS_CACHE_PREFIX}_${logType}` : `${TAGS_CACHE_PREFIX}_all`;
};

const getTimestampKey = (logType?: string): string => {
  return `${getCacheKey(logType)}_timestamp`;
};

export const getTags = async (): Promise<Tag[]> => {
  const cacheKey = getCacheKey();
  const timestampKey = getTimestampKey();

  const cachedTimestamp = localStorage.getItem(timestampKey);
  const cachedTags = localStorage.getItem(cacheKey);

  if (cachedTimestamp && cachedTags) {
    const cacheAge = Date.now() - parseInt(cachedTimestamp, 10);
    if (cacheAge < CACHE_DURATION_MS) {
      return JSON.parse(cachedTags);
    }
  }

  const tags = await apiClient.fetch<Tag[]>(`${API_BASE_URL}/tags`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  localStorage.setItem(cacheKey, JSON.stringify(tags));
  localStorage.setItem(timestampKey, Date.now().toString());

  return tags;
};

export const getTagsByLogType = async (logType: string): Promise<Tag[]> => {
  const cacheKey = getCacheKey(logType);
  const timestampKey = getTimestampKey(logType);

  const cachedTimestamp = localStorage.getItem(timestampKey);
  const cachedTags = localStorage.getItem(cacheKey);

  if (cachedTimestamp && cachedTags) {
    const cacheAge = Date.now() - parseInt(cachedTimestamp, 10);
    if (cacheAge < CACHE_DURATION_MS) {
      return JSON.parse(cachedTags);
    }
  }

  const tags = await apiClient.fetch<Tag[]>(`${API_BASE_URL}/tags?logType=${logType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  localStorage.setItem(cacheKey, JSON.stringify(tags));
  localStorage.setItem(timestampKey, Date.now().toString());

  return tags;
};

export const clearTagsCache = (): void => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(TAGS_CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};
