export class Card {
    private rank: number;
    private sprite: Phaser.GameObjects.Image;

    constructor(rank: number, sprite: Phaser.GameObjects.Image) {
        this.rank = rank;
        this.sprite = sprite;
    }

    getRank(): number {
        return this.rank;
    }

    getSprite(): Phaser.GameObjects.Image {
        return this.sprite;
    }
}