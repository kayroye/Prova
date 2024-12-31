import { NextResponse } from 'next/server';

// Expected request body type

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface EchoRequest {
    message: string;
    timestamp: number;
    metadata?: {
        source: string;
        tags: string[];
    };
}

export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();

        // Validate the required fields
        if (!body.message || typeof body.message !== 'string') {
            return NextResponse.json(
                { error: 'message field is required and must be a string' },
                { status: 400 }
            );
        }

        if (!body.timestamp || typeof body.timestamp !== 'number') {
            return NextResponse.json(
                { error: 'timestamp field is required and must be a number' },
                { status: 400 }
            );
        }

        // If metadata is present, validate its structure
        if (body.metadata) {
            if (typeof body.metadata.source !== 'string' || !Array.isArray(body.metadata.tags)) {
                return NextResponse.json(
                    { error: 'metadata must include a source string and tags array' },
                    { status: 400 }
                );
            }
        }

        // Return the received data
        return NextResponse.json({
            received: body,
            status: 'success',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing echo request:', error);
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // Validate the required fields
        if (!body.message || typeof body.message !== 'string') {
            return NextResponse.json(
                { error: 'message field is required and must be a string' },
                { status: 400 }
            );
        }

        // Return a different format for PUT to demonstrate the difference
        return NextResponse.json({
            method: 'PUT',
            id: id || 'no-id',
            original: body,
            modified: {
                ...body,
                updatedAt: new Date().toISOString(),
                wasModified: true
            }
        });
    } catch (error) {
        console.error('Error processing PUT request:', error);
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }
} 