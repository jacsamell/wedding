const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const headers = {
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    const method = event.requestContext.http.method;
    const path = event.rawPath;
    
    try {
        // Handle routes
        if (path === '/guests' && method === 'POST') {
            return await saveGuest(event);
        } else if (path === '/guests' && method === 'GET') {
            return await getGuestsByIp(event);
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

async function saveGuest(event) {
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    if (!body.name) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Guest name is required' })
        };
    }
    
    const sourceIp = event.requestContext?.http?.sourceIp || 'unknown';
    const guestId = body.id ? `${sourceIp}_${body.id}` : `${sourceIp}_${uuidv4()}`;
    const timestamp = body.timestamp || new Date().toISOString();
    
    // Create individual guest record
    const guestRecord = {
        id: guestId,
        type: 'guest',
        name: body.name,
        dietary: body.dietary || '',
        attending: body.attending !== false, // default to true
        createdAt: timestamp,
        sourceIp: sourceIp
    };
    
    console.log('Saving guest:', guestRecord);
    
    try {
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: guestRecord
        }).promise();
        
        console.log('Guest saved successfully:', guestId);
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Guest saved successfully',
                id: guestId 
            })
        };
    } catch (error) {
        console.error('DynamoDB error:', error);
        throw error;
    }
}

async function getGuestsByIp(event) {
    const sourceIp = event.requestContext?.http?.sourceIp || 'unknown';
    
    console.log('Fetching guests for IP:', sourceIp);
    
    try {
        // Query by sourceIp attribute directly
        const result = await dynamodb.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'sourceIp = :ip AND #type = :type',
            ExpressionAttributeNames: {
                '#type': 'type'
            },
            ExpressionAttributeValues: {
                ':ip': sourceIp,
                ':type': 'guest'
            }
        }).promise();
        
        console.log(`Found ${result.Items.length} guests for IP ${sourceIp}`);
        
        // Transform back to frontend format
        const guests = result.Items.map(item => {
            // Extract row ID from composite ID (IP_rowId)
            const parts = item.id.split('_');
            const rowId = parts[1] || '1';
            
            return {
                id: isNaN(parseInt(rowId)) ? 1 : parseInt(rowId),
                name: item.name,
                dietary: item.dietary || '',
                attending: item.attending !== false,
                saved: true
            };
        });
        
        // Sort by ID to maintain order
        guests.sort((a, b) => a.id - b.id);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ guests })
        };
    } catch (error) {
        console.error('Error fetching guests:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Failed to fetch guests' })
        };
    }
}

async function handleSongRequest(event) {
    const body = JSON.parse(event.body || '{}');
    
    // Handle both direct song data and nested songData format
    const songData = body.songData || body;
    const requestInfo = body.requestInfo || {};
    
    const songRequest = {
        id: uuidv4(),
        type: 'song-request',
        songName: songData.songName || 'Unknown Song',
        artistName: songData.artistName || 'Unknown Artist',
        yourName: songData.yourName || 'Anonymous',
        message: songData.message || '',
        spotifyUri: songData.spotifyUri || '',
        timestamp: requestInfo.timestamp || new Date().toISOString(),
        userAgent: requestInfo.userAgent || event.requestContext?.http?.userAgent || 'unknown',
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
    
    try {
        // Save to DynamoDB
        await dynamodb.put({
            TableName: TABLE_NAME,
            Item: songRequest
        }).promise();
        
        console.log('Song Request Saved to DynamoDB:', songRequest.id);
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: `Song request for "${songRequest.songName}" received! We'll add it to our playlist.`,
                id: songRequest.id
            })
        };
    } catch (error) {
        console.error('DynamoDB error:', error);
        throw error;
    }
}

