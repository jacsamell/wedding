// API Configuration
export const API_CONFIG = {
  // These will be replaced during build with actual Lambda function URLs
  RSVP_API_URL: (import.meta as any).env?.VITE_RSVP_API_URL || '/api/rsvp',
  SPOTIFY_API_URL: (import.meta as any).env?.VITE_SPOTIFY_API_URL || '/api/spotify',
  
  // Development mode detection
  IS_DEV: (import.meta as any).env?.DEV || false
};

// API helper functions
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
