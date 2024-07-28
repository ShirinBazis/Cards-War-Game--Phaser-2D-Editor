export class Card {
    constructor(rank, sprite) {
        this.symbol = rank;
        this.sprite = sprite;
    }
    getSymbol() {
        return this.symbol;
    }
    getSprite() {
        return this.sprite;
    }
}
