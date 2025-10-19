# Offline Support & Service Worker

EverPal now supports offline functionality through a service worker implementation. This provides a better user experience during network issues and cold starts.

## Features

### 1. **Automatic Caching**
- Static assets (app shell, logo, fonts) are cached immediately
- API responses are cached after first successful fetch
- Cached data is used when network is unavailable

### 2. **Offline Detection**
- Visual indicator when app goes offline
- "Back online" notification when connection is restored
- Graceful degradation of features

### 3. **Caching Strategies**

**Static Assets (Cache-First):**
- App shell, images, CSS, JavaScript
- Served from cache instantly
- Updated in background when available

**API Requests (Network-First):**
- Fresh data preferred when online
- Falls back to cached data when offline
- Automatic retry with exponential backoff

## How It Works

### Service Worker Lifecycle

1. **Install**: Cache static assets immediately
2. **Activate**: Clean up old caches
3. **Fetch**: Intercept network requests and apply caching strategies

### Caching Strategy

```
API Request Flow:
┌─────────────┐
│  User Action│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Try Network     │──Success──▶ Cache Response ──▶ Return to User
└─────────────────┘
       │
       │ Fail
       ▼
┌─────────────────┐
│ Check Cache     │──Found────▶ Return Cached Data
└─────────────────┘
       │
       │ Not Found
       ▼
┌─────────────────┐
│ Return Error    │
└─────────────────┘
```

## Files

- `public/service-worker.js` - Service worker implementation
- `src/serviceWorkerRegistration.ts` - Registration and lifecycle management
- `src/components/OfflineIndicator.tsx` - Offline status UI
- `src/main.tsx` - Service worker registration

## Testing Offline Mode

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab → Service Workers
3. Check "Offline" checkbox
4. Reload the page

### Network Throttling
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown

### Testing Cache
1. Load the app while online
2. Navigate around to cache API responses
3. Go offline (DevTools or disconnect internet)
4. App should continue working with cached data

## Updating the App

When a new version is deployed:
1. Service worker detects the update
2. New version is installed in background
3. User sees prompt: "New version available! Reload to update?"
4. Clicking "OK" activates new version

## Cache Management

### Viewing Cached Data
Chrome DevTools → Application → Cache Storage

### Clearing Cache (For Debugging)
```javascript
// Open browser console and run:
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

Or use the helper function:
```javascript
import { clearCaches } from './serviceWorkerRegistration';
clearCaches();
```

## Configuration

### Cache Names
- `everpal-v1` - Static assets
- `everpal-api-v1` - API responses

### API Patterns Cached
- `/api/pets`
- `/api/healthlogs`

### Update Check Interval
- Service worker checks for updates every hour
- Also checks on page load

## Performance Benefits

### Cold Start Mitigation
1. **First Visit**: Normal network requests, data cached
2. **Subsequent Visits**: Instant load from cache, updated in background
3. **During Cold Start**: Cached data shown immediately, new data synced when ready

### Offline Capabilities
- ✅ View pet profiles (cached)
- ✅ View health journal (cached entries)
- ✅ Browse previously loaded data
- ❌ Add new entries (requires online)
- ❌ Edit/delete (requires online)

## Browser Support

Service workers are supported in:
- Chrome/Edge 40+
- Firefox 44+
- Safari 11.1+
- Mobile browsers (iOS Safari 11.3+, Chrome Android)

Falls back gracefully in unsupported browsers.

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS (service workers require secure context)
- Check that `service-worker.js` is accessible

### Stale Cache
- Update cache version in `service-worker.js` (`CACHE_NAME = 'everpal-v2'`)
- Old caches are automatically deleted on activation

### Cache Too Large
- Limit API cache to recent requests only
- Add cache expiration logic
- Use IndexedDB for larger datasets

## Future Enhancements

- [ ] Background sync for offline actions
- [ ] Push notifications
- [ ] Installable PWA (Add to Home Screen)
- [ ] Advanced cache strategies (stale-while-revalidate)
- [ ] Cache analytics and monitoring
