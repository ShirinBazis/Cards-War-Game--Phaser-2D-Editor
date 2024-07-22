var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameManager, GameState } from '../Scripts/GameManager.js';
export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        /* START-USER-CTR-CODE */
        // Write your code here.
        /* END-USER-CTR-CODE */
    }
    editorCreate() {
        // bg
        const bg = this.add.image(408, 301, "bg");
        bg.scaleX = 1.5;
        bg.scaleY = 1.7;
        // symbols_layer
        const symbols_layer = this.add.layer();
        // red_ace
        const red_ace = this.add.image(340, 393, "symbols", "symbol_50");
        red_ace.scaleX = 0.4;
        red_ace.scaleY = 0.4;
        symbols_layer.add(red_ace);
        // black_back
        const black_back = this.add.image(340, 203, "symbol_back", "back_black");
        black_back.scaleX = 1.17;
        black_back.scaleY = 1.17;
        symbols_layer.add(black_back);
        // red_back
        const red_back = this.add.image(464.8718390723502, 393, "symbol_back", "back_red");
        red_back.scaleX = 1.17;
        red_back.scaleY = 1.17;
        symbols_layer.add(red_back);
        // black_ace
        const black_ace = this.add.image(464.8718390723502, 203, "symbols", "symbol_51");
        black_ace.scaleX = 0.4;
        black_ace.scaleY = 0.4;
        symbols_layer.add(black_ace);
        this.bg = bg;
        this.events.emit("scene-awake");
        this.playerDeck = this.add.image(340, 393, "symbol_back", "back_red");
        this.playerDeck.setScale(1.17);
        this.aiDeck = this.add.image(464.8718390723502, 203, "symbol_back", "back_black");
        this.aiDeck.setScale(1.17);
    }
    /* START-USER-CODE */
    // Write your code here
    preload() {
        this.load.pack("pack", './Assets/game_pack_sd.json');
    }
    // create() {
    // 	this.editorCreate();
    // 	this.game.events.emit("GameCreated");
    // }
    create() {
        this.editorCreate();
        this.gameManager = new GameManager(this);
        this.dealButton = this.add.text(400, 300, 'Deal', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 7.5)
            .setInteractive()
            .on('pointerdown', () => this.startGame());
        this.battleText = this.add.text(400, 200, '', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 5.5)
            .setVisible(false);
        this.playerDeck.setInteractive()
            .on('pointerdown', () => this.playTurn());
        this.game.events.emit("GameCreated");
    }
    /* END-USER-CODE */
    startGame() {
        this.gameManager.startGame();
        this.dealButton.setVisible(false);
        this.battleText.setVisible(true);
    }
    playTurn() {
        if (this.gameManager.getState() === GameState.BATTLE) {
            this.gameManager.playTurn();
        }
    }
    updateUI(message) {
        this.battleText.setText(message);
    }
    dealCards() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        for (let i = 0; i < 26; i++) {
            const card = this.add.image(centerX, centerY, 'card-back').setScale(0.5);
            this.tweens.add({
                targets: card,
                x: this.playerDeck.x,
                y: this.playerDeck.y,
                duration: 300,
                delay: i * 50,
                onComplete: () => card.destroy()
            });
            const aiCard = this.add.image(centerX, centerY, 'card-back').setScale(0.5);
            this.tweens.add({
                targets: aiCard,
                x: this.aiDeck.x,
                y: this.aiDeck.y,
                duration: 300,
                delay: i * 50,
                onComplete: () => aiCard.destroy()
            });
        }
    }
    revealCard(card, x, y) {
        return new Promise((resolve) => {
            const cardSprite = card.getSprite().setVisible(true).setPosition(x, y);
            this.tweens.add({
                targets: cardSprite,
                scaleX: 0,
                duration: 250,
                onComplete: () => {
                    this.tweens.add({
                        targets: cardSprite,
                        scaleX: 0.5,
                        duration: 250,
                        onComplete: () => {
                            // Add a delay before resolving the promise
                            this.time.delayedCall(500, () => {
                                resolve();
                            });
                        }
                    });
                }
            });
        });
    }
    revealCards(playerCard, aiCard) {
        // Implement card reveal animation here
        playerCard.getSprite().setVisible(true).setPosition(340, 393);
        aiCard.getSprite().setVisible(true).setPosition(464.8718390723502, 203);
    }
    moveCardsToWinner(winnerDeck, cards) {
        return new Promise((resolve) => {
            let completedCount = 0;
            cards.forEach((card, index) => {
                this.tweens.add({
                    targets: card,
                    x: winnerDeck.x,
                    y: winnerDeck.y,
                    duration: 500,
                    delay: index * 200,
                    onComplete: () => {
                        card.destroy();
                        completedCount++;
                        if (completedCount === cards.length) {
                            resolve();
                        }
                    }
                });
            });
        });
    }
    showWarAnimation(warCards) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            // Show "WAR!" text
            const warText = this.add.text(centerX, centerY - 100, 'WAR!', { fontSize: '64px', color: '#ff0000' })
                .setOrigin(0.5)
                .setAlpha(0);
            // Fade in and out the "WAR!" text
            this.tweens.add({
                targets: warText,
                alpha: 1,
                duration: 500,
                yoyo: true,
                hold: 1000,
                onComplete: () => warText.destroy()
            });
            yield this.delay(2000); // Wait for the text animation
            // Show face-down cards
            const faceDownCards = [];
            for (let i = 0; i < 3; i++) {
                const playerCard = this.add.image(centerX - 100 + i * 50, centerY - 50, 'card-back').setScale(0.4).setAlpha(0);
                const aiCard = this.add.image(centerX - 100 + i * 50, centerY + 50, 'card-back').setScale(0.4).setAlpha(0);
                faceDownCards.push(playerCard, aiCard);
                // Fade in the face-down cards
                this.tweens.add({
                    targets: [playerCard, aiCard],
                    alpha: 1,
                    duration: 300,
                    delay: i * 200
                });
                yield this.delay(200);
            }
            yield this.delay(1000); // Wait a bit after all cards are shown
            // Reveal final war cards
            const playerFinalCard = warCards[warCards.length - 2];
            const aiFinalCard = warCards[warCards.length - 1];
            yield this.revealCard(playerFinalCard, centerX - 50, centerY - 50);
            yield this.delay(500);
            yield this.revealCard(aiFinalCard, centerX - 50, centerY + 50);
            yield this.delay(2000); // Wait for players to see the final cards
            // Clean up the face-down cards
            faceDownCards.forEach(card => card.destroy());
            resolve();
        }));
    }
    showEndGameScreen(playerWon) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const message = playerWon ? 'You Won!' : 'Try Again';
        const text = this.add.text(centerX, centerY - 50, message, { fontSize: '48px', color: '#fff' }).setOrigin(0.5);
        const replayButton = this.add.text(centerX, centerY + 50, 'Play Again', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.scene.restart());
        // Add some animation to the text and button
        this.tweens.add({
            targets: [text, replayButton],
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            duration: 800
        });
    }
    delay(ms) {
        return new Promise(resolve => this.time.delayedCall(ms, resolve));
    }
}
/* END OF COMPILED CODE */
// You can write more code here
