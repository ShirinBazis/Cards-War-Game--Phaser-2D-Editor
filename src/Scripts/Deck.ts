import { Card } from './Card.js';

export class Deck {
    private cards: Card[];

    constructor(scene: Phaser.Scene) {
        this.cards = [];
        this.initialize(scene);
    }

    private initialize(scene: Phaser.Scene): void {
        for (let i = 0; i < 52; i++) {
            const sprite = scene.add.image(0, 0, "symbols", `symbol_${i}`).setScale(0.4).setVisible(false);
            this.cards.push(new Card(i, sprite));
        }
    }

    shuffle(): void {
        for (let i = this.cards.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(): Card | undefined {
        return this.cards.pop();
    }
}