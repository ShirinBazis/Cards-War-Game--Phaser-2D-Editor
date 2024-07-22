export class Card {
    constructor(rank, sprite) {
        this.rank = rank;
        this.sprite = sprite;
    }
    getRank() {
        return this.rank;
    }
    getSprite() {
        return this.sprite;
    }
}
