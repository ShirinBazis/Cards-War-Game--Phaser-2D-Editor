export class Card {
    constructor(rank, sprite, symbolNumber) {
        this.rank = rank;
        this.sprite = sprite;
        this.symbolNumber = symbolNumber;
    }
    getRank() {
        return this.rank;
    }
    getSprite() {
        return this.sprite;
    }
    getSymbolNumber() {
        return this.symbolNumber;
    }
}
