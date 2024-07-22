import { Card } from './Card.js';

export class Player {
    private deck: Card[];
    private isAI: boolean;
    private deckSprite: Phaser.GameObjects.Image;

    constructor(isAI: boolean, deckSprite: Phaser.GameObjects.Image) {
        this.deck = [];
        this.isAI = isAI;
        this.deckSprite = deckSprite;
    }

    addCard(card: Card): void {
        this.deck.push(card);
    }

    addCards(cards: Card[]): void {
        cards.forEach(card => this.deck.push(card));
    }

    playCard(): Card | undefined {
        return this.deck.shift();
    }

    getDeckSize(): number {
        return this.deck.length;
    }

    isAIPlayer(): boolean {
        return this.isAI;
    }

    getDeckSprite(): Phaser.GameObjects.Image {
        return this.deckSprite;
    }
}