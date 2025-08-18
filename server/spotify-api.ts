// Local Spotify API for development
// This uses Spotify's Client Credentials flow for searching (no user auth needed)

const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID || '41278d2363e94573827630269c427c34';
const SPOTIFY_CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET || '85b4fccfa91f4923bd382722c1439b70';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early
  
  return accessToken;
}

export async function searchSpotifyTracks(query: string) {
  const token = await getAccessToken();
  
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();
  
  return data.tracks.items.map((track: any) => ({
    id: track.id,
    uri: track.uri,
    name: track.name,
    artists: track.artists.map((a: any) => a.name).join(', '),
    album: track.album.name,
    image: track.album.images[2]?.url || track.album.images[0]?.url,
    preview_url: track.preview_url
  }));
}
