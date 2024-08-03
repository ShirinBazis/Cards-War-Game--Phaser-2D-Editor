export class Player {
    constructor() {
        this.deck = [];
    }
    addCard(card) {
        this.deck.push(card);
    }
    addCards(cards) {
        this.deck.push(...cards);
    }
    playCard() {
        return this.deck.shift();
    }
    getDeckLength() {
        return this.deck.length;
    }
}
