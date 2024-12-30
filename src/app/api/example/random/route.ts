import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const min = parseInt(searchParams.get('min') || '1');
    const max = parseInt(searchParams.get('max') || '100');

    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return NextResponse.json({
        number: randomNumber,
        range: { min, max }
    });
} 