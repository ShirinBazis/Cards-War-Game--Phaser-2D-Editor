export class Card {
    private symbol: number;
    private sprite: Phaser.GameObjects.Image;

    constructor(symbol: number, sprite: Phaser.GameObjects.Image) {
        this.symbol = symbol;
        this.sprite = sprite;
    }

    getSymbol(): number {
        return this.symbol;
    }

    getSprite(): Phaser.GameObjects.Image {
        return this.sprite;
    }
}