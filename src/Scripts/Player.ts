import { Card } from './Card.js';

export class Player {
    private deck: Card[];

    constructor() {
        this.deck = [];
    }

    addCard(card: Card): void {
        this.deck.push(card);
    }

    addCards(cards: Card[]): void {
        this.deck.push(...cards);
    }

    playCard(): Card | undefined {
        return this.deck.shift();
    }

    getDeckLength(): number {
        return this.deck.length;
    }
}