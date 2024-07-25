export class Card {
    private rank: number;
    private sprite: Phaser.GameObjects.Image;
    private symbolNumber: number;

    constructor(rank: number, sprite: Phaser.GameObjects.Image, symbolNumber: number) {
        this.rank = rank;
        this.sprite = sprite;
        this.symbolNumber = symbolNumber;
    }

    getRank(): number {
        return this.rank;
    }

    getSprite(): Phaser.GameObjects.Image {
        return this.sprite;
    }

    getSymbolNumber(): number {
        return this.symbolNumber;
    }
}