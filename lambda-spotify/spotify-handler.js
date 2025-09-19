const SpotifyWebApi = require('spotify-web-api-node');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE;

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
        
        const songRequest = {
          id: uuidv4(),
          type: 'song-request-spotify',
          songName: songData.songName || 'Unknown Song',
          artistName: songData.artistName || 'Unknown Artist',
          yourName: songData.yourName || 'Anonymous',
          message: songData.message || '',
          spotifyUri: songData.spotifyUri || '',
          timestamp: requestInfo?.timestamp || new Date().toISOString(),
          userAgent: requestInfo?.userAgent || event.requestContext?.http?.userAgent || 'unknown',
          sourceIp: event.requestContext?.http?.sourceIp || 'unknown',
          createdAt: new Date().toISOString()
        };
        
        // Log request details to CloudWatch
        console.log('Song Request via Spotify Lambda:', songRequest);
        
        // Save to DynamoDB if table is configured
        if (DYNAMODB_TABLE) {
          try {
            await dynamodb.put({
              TableName: DYNAMODB_TABLE,
              Item: songRequest
            }).promise();
            console.log('Song Request Saved to DynamoDB:', songRequest.id);
          } catch (dbError) {
            console.error('DynamoDB save error (non-fatal):', dbError);
            // Continue even if DynamoDB save fails
          }
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Song request received! We\'ll add it soon.',
            id: songRequest.id
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

