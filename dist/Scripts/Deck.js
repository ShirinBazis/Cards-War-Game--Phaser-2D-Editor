import { Card } from './Card.js';
export class Deck {
    constructor(scene) {
        this.cards = [];
        this.initialize(scene);
    }
    initialize(scene) {
        for (let i = 0; i < 52; i++) {
            const sprite = scene.add.image(0, 0, "symbols", `symbol_${i}`).setScale(0.4).setVisible(false);
            this.cards.push(new Card(i, sprite));
        }
    }
    shuffle() {
        for (let i = this.cards.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    deal() {
        return this.cards.pop();
    }
}
