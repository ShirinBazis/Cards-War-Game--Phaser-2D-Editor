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
        this.deck.push(...cards);
    }
    playCard() {
        return this.deck.shift();
    }
    getDeckLength() {
        return this.deck.length;
    }
    isAIPlayer() {
        return this.isAI;
    }
    getDeckSprite() {
        return this.deckSprite;
    }
}
