const SpotifyWebApi = require('spotify-web-api-node');
const { v4: uuidv4 } = require('uuid');

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Initialize Spotify API with your app credentials
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Refresh token for your account (keeps you logged in)
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

async function refreshAccessToken() {
  try {
    spotifyApi.setRefreshToken(refreshToken);
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);
    return data.body['access_token'];
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
  };

  console.log('Event:', JSON.stringify(event, null, 2));
  
  const method = event.requestContext.http.method;
  const path = event.rawPath;

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await refreshAccessToken();
    const body = JSON.parse(event.body || '{}');
    const { action } = body;

    switch (action) {
      case 'search':
        const { query } = body;
        const searchResults = await spotifyApi.searchTracks(query, { limit: 10 });
        
        const tracks = searchResults.body.tracks.items.map(track => ({
          id: track.id,
          uri: track.uri,
          name: track.name,
          artists: track.artists.map(a => a.name).join(', '),
          album: track.album.name,
          image: track.album.images[0]?.url,
          preview_url: track.preview_url
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ tracks })
        };

      case 'addToPlaylist':
        const { trackUri, playlistId } = body;
        await spotifyApi.addTracksToPlaylist(
          playlistId || '0pm5pbUgvyQtdJdcAIffNO',
          [trackUri]
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Song added to playlist!' })
        };

      case 'requestSong':
        const { songData, requestInfo } = body;
        
        // Log request details
        console.log('Song Request:', {
          song: `${songData.songName} by ${songData.artistName}`,
          requestedBy: songData.yourName,
          message: songData.message,
          spotifyUri: songData.spotifyUri,
          timestamp: requestInfo.timestamp,
          userAgent: requestInfo.userAgent,
          sourceIp: event.requestContext?.http?.sourceIp || 'unknown'
        });
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Song request received! We\'ll add it soon.' 
          })
        };

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

