export class Player {
    constructor(isAI, deckSprite) {
        this.deck = [];
        this.isAI = isAI;
        this.deckSprite = deckSprite;
    }
    addCard(card) {
        this.deck.push(card);
    }
    addCards(cards) {
        cards.forEach(card => this.deck.push(card));
    }
    playCard() {
        return this.deck.shift();
    }
    getDeckSize() {
        return this.deck.length;
    }
    isAIPlayer() {
        return this.isAI;
    }
    getDeckSprite() {
        return this.deckSprite;
    }
}
