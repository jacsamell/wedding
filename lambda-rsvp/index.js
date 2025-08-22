const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    
    try {
        // Handle CORS preflight
        if (method === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: ''
            };
        }
        
        // Handle RSVP routes
        if (path === '/rsvp' && method === 'POST') {
            return await createRsvp(event);
        } else if (path === '/song-request' && method === 'POST') {
            return await handleSongRequest(event);
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ message: 'Not Found' })
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};

async function createRsvp(event) {
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields - expecting guests array
    if (!body.guests || !Array.isArray(body.guests) || body.guests.length === 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Guests array is required' })
        };
    }
    
    const submissionId = uuidv4();
    const timestamp = new Date().toISOString();
    const sourceIp = event.requestContext?.http?.sourceIp || 'unknown';
    
    // Create one row per guest
    const guestRecords = body.guests.map((guest, index) => ({
        id: uuidv4(),
        submissionId: submissionId,
        name: guest.name || 'Unknown',
        dietary: guest.dietary || '',
        attending: guest.attending !== false, // default to true
        guestNumber: index + 1,
        totalGuestsInSubmission: body.guests.length,
        createdAt: timestamp,
        sourceIp: sourceIp,
        type: 'guest' // single guest record
    }));
    
    // Log RSVP submission
    console.log('RSVP Submission:', {
        submissionId: submissionId,
        guestCount: guestRecords.length,
        attendingCount: guestRecords.filter(g => g.attending).length,
        primaryGuest: guestRecords[0]?.name || 'Unknown',
        allGuests: guestRecords.map(g => ({
            name: g.name,
            attending: g.attending,
            dietary: g.dietary
        })),
        timestamp: timestamp,
        sourceIp: sourceIp
    });
    
    try {
        // Batch write all guest records
        const putRequests = guestRecords.map(guest => ({
            PutRequest: {
                Item: guest
            }
        }));
        
        await dynamodb.batchWrite({
            RequestItems: {
                [TABLE_NAME]: putRequests
            }
        }).promise();
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                id: submissionId,
                guests: guestRecords,
                message: 'RSVP saved successfully'
            })
        };
    } catch (error) {
        console.error('DynamoDB error:', error);
        throw error;
    }
}

async function handleSongRequest(event) {
    const body = JSON.parse(event.body || '{}');
    
    const songRequest = {
        id: uuidv4(),
        songName: body.songName,
        artistName: body.artistName,
        yourName: body.yourName || 'Anonymous',
        message: body.message || '',
        spotifyUri: body.spotifyUri || '',
        timestamp: body.timestamp || new Date().toISOString(),
        userAgent: body.userAgent || event.requestContext?.http?.userAgent || 'unknown',
        sourceIp: event.requestContext?.http?.sourceIp || 'unknown',
        createdAt: new Date().toISOString()
    };
    
    // Log song request details
    console.log('Song Request:', {
        id: songRequest.id,
        song: `${songRequest.songName} by ${songRequest.artistName}`,
        requestedBy: songRequest.yourName,
        message: songRequest.message,
        spotifyUri: songRequest.spotifyUri,
        userAgent: songRequest.userAgent,
        sourceIp: songRequest.sourceIp,
        timestamp: songRequest.createdAt
    });
    
    // Just log the request, don't store in DynamoDB
    console.log('Song Request Received - Full Details:', JSON.stringify(songRequest, null, 2));
    
    return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
            success: true,
            message: `Song request for "${songRequest.songName}" received! We'll add it to our playlist.`,
            id: songRequest.id
        })
    };
}

