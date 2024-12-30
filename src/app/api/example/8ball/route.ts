import { NextResponse } from 'next/server';

const RESPONSES = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy, try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful"
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const question = searchParams.get('question') || 'No question asked';
    const response = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    return NextResponse.json({
        question,
        answer: response
    });
} 