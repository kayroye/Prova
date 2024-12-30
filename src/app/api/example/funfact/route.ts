import { NextResponse } from 'next/server';

const FUN_FACTS = [
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.",
    "A day on Venus is longer than its year. Venus takes 243 Earth days to rotate on its axis but only 225 Earth days to orbit the Sun.",
    "The first oranges weren't orange. The original oranges from Southeast Asia were actually green.",
    "A cloud can weigh more than a million pounds. The average cumulus cloud weighs 1.1 million pounds.",
    "Bananas are berries, but strawberries aren't. Botanically speaking, bananas are berries while strawberries are accessory fruits.",
    "The shortest war in history lasted 38 minutes. It was between Britain and Zanzibar in 1896.",
    "Octopuses have three hearts. Two pump blood to the gills while the third circulates it to the rest of the body.",
    "The Great Wall of China is not visible from space with the naked eye, contrary to popular belief.",
    "Sloths can hold their breath for up to 40 minutes underwater.",
    "A group of flamingos is called a 'flamboyance'."
];

export async function GET() {
    const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

    return NextResponse.json({
        fact: randomFact,
        totalFacts: FUN_FACTS.length
    });
} 