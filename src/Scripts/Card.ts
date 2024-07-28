export class Card {
    private symbol: number;
    private sprite: Phaser.GameObjects.Image;

    constructor(rank: number, sprite: Phaser.GameObjects.Image) {
        this.symbol = rank;
        this.sprite = sprite;
    }

    getSymbol(): number {
        return this.symbol;
    }

    getSprite(): Phaser.GameObjects.Image {
        return this.sprite;
    }
}