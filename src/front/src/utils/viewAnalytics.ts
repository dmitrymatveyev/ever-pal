/**
 * Debug utility to view analytics events
 *
 * Usage in browser console:
 *
 * // View all events:
 * viewAnalytics()
 *
 * // View specific event type:
 * viewAnalytics('onboarding_started')
 *
 * // Export events as CSV:
 * exportAnalytics()
 */

export function viewAnalytics(eventFilter?: string) {
  try {
    const stored = localStorage.getItem('analytics_events');
    if (!stored) {
      console.log('No analytics events recorded yet.');
      return;
    }

    const events = JSON.parse(stored);

    if (eventFilter) {
      const filtered = events.filter((e: any) => e.event === eventFilter);
      console.table(filtered);
      console.log(`Found ${filtered.length} events of type "${eventFilter}"`);
    } else {
      console.table(events);
      console.log(`Total events: ${events.length}`);

      // Show event summary
      const summary: Record<string, number> = {};
      events.forEach((e: any) => {
        summary[e.event] = (summary[e.event] || 0) + 1;
      });

      console.log('\nEvent Summary:');
      console.table(summary);
    }

    return events;
  } catch (err) {
    console.error('Failed to view analytics:', err);
  }
}

export function exportAnalytics() {
  try {
    const stored = localStorage.getItem('analytics_events');
    if (!stored) {
      console.log('No analytics events to export.');
      return;
    }

    const events = JSON.parse(stored);

    // Convert to CSV
    const headers = ['event', 'timestamp', 'properties'];
    const rows = events.map((e: any) => {
      return [
        e.event,
        new Date(e.timestamp).toISOString(),
        JSON.stringify(e.properties || {})
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    // Download as file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    console.log(`Exported ${events.length} events to CSV`);
  } catch (err) {
    console.error('Failed to export analytics:', err);
  }
}

export function clearAnalytics() {
  localStorage.removeItem('analytics_events');
  console.log('Analytics events cleared.');
}

// Make functions available globally in development
if (import.meta.env.DEV) {
  (window as any).viewAnalytics = viewAnalytics;
  (window as any).exportAnalytics = exportAnalytics;
  (window as any).clearAnalytics = clearAnalytics;
}
