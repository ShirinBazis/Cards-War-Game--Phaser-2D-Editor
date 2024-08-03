var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/// <reference path="../../node_modules/phaser/types/phaser.d.ts"/>
/* START OF COMPILED CODE */
import { GameManager, GameState } from '../Scripts/GameManager.js';
import { Sound } from '../Scripts/Sound.js';
export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.centerX = 0;
        this.centerY = 0;
        this.cardsIndex = 0;
        this.autoPlay = false;
        this.inProgress = {
            turn: false,
            autoTurn: false,
            threeCards: false,
            autoThreeCards: false,
            finalCard: false,
        };
        this.sounds = new Map([
            ["click", new Sound(this, "click", "wav")],
            ["shuffle", new Sound(this, "shuffle")],
            ["battle-win", new Sound(this, "battle-win", "wav")],
            ["battle-lose", new Sound(this, "battle-lose")],
            ["war", new Sound(this, "war")],
            ["war-win", new Sound(this, "war-win")],
            ["war-lose", new Sound(this, "war-lose")],
            ["winner", new Sound(this, "winner")],
            ["loser", new Sound(this, "loser")],
            ["restart", new Sound(this, "restart", "wav")]
        ]);
    }
    preload() {
        this.load.pack("pack", './Assets/game_pack_sd.json');
        this.load.image('war', './Assets/bg/war.jpeg');
        this.sounds.forEach((sound) => sound.load());
    }
    editorCreate() {
        this.centerX = this.cameras.main.width / 2;
        this.centerY = this.cameras.main.height / 2;
        // bg
        this.background = this.add.image(this.centerX, this.centerY, "bg").setScale(1.7).setVisible(true);
        this.warBackground = this.add.image(this.centerX, this.centerY, "war").setScale(1.7).setVisible(false);
        // symbols_layer
        const symbols_layer = this.add.layer();
        // main_deck
        this.deck = this.add.image(this.centerX, this.centerY, "symbol_back", "back_red").setScale(1.1);
        symbols_layer.add(this.deck);
        this.dealButton = this.add.text(this.centerX, this.centerY, 'Deal', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 7.5)
            .setInteractive()
            .on('pointerdown', () => {
            var _a;
            (_a = this.sounds.get("shuffle")) === null || _a === void 0 ? void 0 : _a.play();
            this.startGame();
            this.drawAutoPlayButton();
        }).on('pointerover', () => {
            this.game.canvas.classList.add('pointer-cursor');
        }).on('pointerout', () => {
            this.game.canvas.classList.remove('pointer-cursor');
        });
        this.events.emit("scene-awake");
    }
    create() {
        // Sounds
        this.sounds.forEach((sound) => sound.create());
        this.editorCreate();
        this.gameManager = new GameManager(this);
        this.battleText = this.add.text(this.centerX, 200, '', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 5.5)
            .setVisible(false);
        this.currentWarCardsText = this.add.text(580, 100, '', { font: 'bold 18px Arial', color: '#000000' }).setVisible(false);
        this.playerDeckSize = { x: 500, y: 450 };
        this.aiDeckSize = { x: 300, y: 200 };
        this.playerDeck = this.add.image(this.playerDeckSize.x, this.playerDeckSize.y, "symbol_back", "back_red");
        this.playerDeck.setScale(1.1);
        this.playerDeck.setVisible(false);
        this.aiDeck = this.add.image(this.aiDeckSize.x, this.aiDeckSize.y, "symbol_back", "back_red");
        this.aiDeck.setScale(1.1);
        this.aiDeck.setVisible(false);
        this.game.events.emit("GameCreated");
    }
    enablePlayerInteraction(callback) {
        this.playerDeck.setInteractive()
            .once('pointerdown', () => {
            var _a;
            (_a = this.sounds.get("click")) === null || _a === void 0 ? void 0 : _a.play();
            callback();
        }).on('pointerover', () => {
            this.game.canvas.classList.add('pointer-cursor');
        }).on('pointerout', () => {
            this.game.canvas.classList.remove('pointer-cursor');
        });
    }
    startGame() {
        this.gameManager.startGame();
        this.dealButton.setVisible(false);
        this.battleText.setVisible(true);
        if (!this.autoPlay) {
            this.enablePlayerInteraction(() => this.playTurn());
        }
        else {
            this.autoPlayTurn();
        }
    }
    dealCardAnimation() {
        return new Promise((resolve) => {
            for (let i = 0; i < 26; i++) {
                // const centerX = this.cameras.main.width / 2;
                // const centerY = this.cameras.main.height / 2;
                const playerCard = this.add.image(this.centerX, this.centerY, "symbol_back", "back_red").setScale(1.1);
                this.tweens.add({
                    targets: playerCard,
                    x: this.playerDeckSize.x,
                    y: this.playerDeckSize.y,
                    duration: 300,
                    delay: i * 50,
                    onComplete: () => {
                        playerCard.destroy();
                    }
                });
                const aiCard = this.add.image(this.centerX, this.centerY, "symbol_back", "back_red").setScale(1.1);
                this.tweens.add({
                    targets: aiCard,
                    x: this.aiDeckSize.x,
                    y: this.aiDeckSize.y,
                    duration: 300,
                    delay: i * 50,
                    onComplete: () => {
                        aiCard.destroy();
                    }
                });
            }
            resolve();
        });
    }
    dealCards() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dealCardAnimation();
            this.deck.setVisible(false);
            this.playerDeck.setVisible(true);
            this.aiDeck.setVisible(true);
            this.currentWarCardsText.setText(`AI: ${this.gameManager.aiPlayer.getDeckLength()} - You: ${this.gameManager.player.getDeckLength()}`).setVisible(true);
        });
    }
    revealCard(card, isPlayer = false) {
        return new Promise((resolve) => {
            const cardSprite = isPlayer ? this.add.image(this.playerDeckSize.x, this.playerDeckSize.y, "symbols", `symbol_${card.getSymbol()}`).setScale(0.4)
                : this.add.image(this.aiDeckSize.x, this.aiDeckSize.y, "symbols", `symbol_${card.getSymbol()}`).setScale(0.4);
            this.tweens.add({
                targets: cardSprite,
                scaleX: 0,
                duration: 250,
                onComplete: () => {
                    this.tweens.add({
                        targets: cardSprite,
                        scaleX: 0.4,
                        duration: 250,
                        onComplete: () => {
                            this.time.delayedCall(200, () => {
                                resolve(cardSprite);
                            });
                        }
                    });
                }
            });
        });
    }
    moveCardsToWinner(winnerDeck, sprites) {
        return new Promise((resolve) => {
            let completedCount = 0;
            sprites.forEach((sprite) => {
                this.tweens.add({
                    targets: sprite,
                    x: winnerDeck.x,
                    y: winnerDeck.y,
                    duration: 400,
                    delay: 100,
                    onComplete: () => {
                        if (sprite) {
                            sprite.destroy();
                        }
                        completedCount++;
                        if (completedCount === sprites.length) {
                            this.currentWarCardsText.setText(`AI: ${this.gameManager.aiPlayer.getDeckLength()} - You: ${this.gameManager.player.getDeckLength()}`);
                            resolve();
                        }
                    }
                });
            });
        });
    }
    autoPlayTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inProgress.autoTurn)
                return;
            this.inProgress.autoTurn = true;
            this.playerDeck.removeAllListeners();
            // Auto play loop
            while (this.autoPlay && this.gameManager.getState() === GameState.BATTLE) {
                yield this.gameManager.playTurn();
            }
            // Auto play off
            if (!this.autoPlay && this.gameManager.getState() === GameState.BATTLE) {
                this.enablePlayerInteraction(() => this.playTurn());
            }
            this.inProgress.autoTurn = false;
        });
    }
    playTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inProgress.turn)
                return;
            this.inProgress.turn = true;
            this.battleText.setVisible(false);
            this.playerDeck.removeAllListeners();
            if (this.gameManager.getState() === GameState.BATTLE) {
                yield this.gameManager.playTurn();
            }
            // Auto play off
            if (!this.autoPlay && this.gameManager.getState() === GameState.BATTLE) {
                this.enablePlayerInteraction(() => this.playTurn());
            }
            // Auto play on
            if (this.autoPlay && this.gameManager.getState() === GameState.BATTLE) {
                yield this.autoPlayTurn();
            }
            this.inProgress.turn = false;
        });
    }
    updateUI(message) {
        this.battleText.setText(message).setVisible(true);
    }
    toggleBackground(isWar) {
        this.background.setVisible(!isWar);
        this.warBackground.setVisible(isWar);
    }
    backCardAnimation(i, isPlayer = false) {
        return new Promise((resolve) => {
            const card = isPlayer ? this.add.image(this.playerDeckSize.x, this.playerDeckSize.y - (i * 10), 'symbol_back', 'back_red').setScale(1.1)
                : this.add.image(this.aiDeckSize.x, this.aiDeckSize.y - (i * 10), 'symbol_back', 'back_red').setScale(1.1);
            this.tweens.add({
                targets: card,
                alpha: 1,
                duration: 300,
                delay: 0,
                onComplete: () => resolve(card)
            });
        });
    }
    addPlayerBackCard() {
        return __awaiter(this, void 0, void 0, function* () {
            const sprite = yield this.backCardAnimation(this.cardsIndex, true);
            this.sprites.push(sprite);
            ++this.cardsIndex;
            if (this.cardsIndex === 3) {
                this.warText.setVisible(false);
                yield this.AIThreeCards();
            }
        });
    }
    playerThreeCards() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inProgress.autoThreeCards)
                return;
            this.inProgress.autoThreeCards = true;
            this.playerDeck.removeAllListeners();
            this.warText.setVisible(false);
            // Auto play loop
            while (this.autoPlay && this.gameManager.getState() === GameState.THREE_CARDS && this.cardsIndex < 3) {
                yield this.addPlayerBackCard();
            }
            // Auto play off
            if (!this.autoPlay && this.gameManager.getState() === GameState.THREE_CARDS && this.cardsIndex < 3) {
                this.warText.setText(`Add ${3 - this.cardsIndex} hidden cards`).setVisible(true);
                this.enablePlayerInteraction(() => this.offThreeCards());
            }
            this.inProgress.autoThreeCards = false;
        });
    }
    offThreeCards() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inProgress.threeCards)
                return;
            this.inProgress.threeCards = true;
            this.warText.setVisible(false);
            this.battleText.setVisible(false);
            this.playerDeck.removeAllListeners();
            if (this.gameManager.getState() === GameState.THREE_CARDS && this.cardsIndex < 3) {
                yield this.addPlayerBackCard();
            }
            // Auto play off
            if (!this.autoPlay && this.gameManager.getState() === GameState.THREE_CARDS && this.cardsIndex < 3) {
                this.warText.setText(`Add ${3 - this.cardsIndex} hidden cards`).setVisible(true);
                this.enablePlayerInteraction(() => this.offThreeCards());
            }
            // Auto play on
            if (this.autoPlay && this.gameManager.getState() === GameState.THREE_CARDS && this.cardsIndex < 3) {
                yield this.playerThreeCards();
            }
            this.inProgress.threeCards = false;
        });
    }
    AIThreeCards() {
        return __awaiter(this, void 0, void 0, function* () {
            this.gameManager.state = GameState.WAR;
            this.warText.setVisible(false);
            this.playerDeck.removeAllListeners();
            // AI cards
            for (let i = 0; i < 3; i++) {
                const sprite = yield this.backCardAnimation(i);
                this.sprites.push(sprite);
            }
            this.gameManager.state = GameState.FINAL_CARD;
            yield this.finalCard();
        });
    }
    finalCard() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inProgress.finalCard)
                return;
            this.inProgress.finalCard = true;
            this.playerDeck.removeAllListeners();
            // Auto play on
            if (this.autoPlay) {
                this.cardsIndex++;
                this.warText.setVisible(false);
                yield this.gameManager.revealFinalWarCards(this.sprites);
                // Auto play off
            }
            else {
                this.warText.setText("Add final card").setVisible(true);
                this.enablePlayerInteraction(() => __awaiter(this, void 0, void 0, function* () {
                    this.cardsIndex++;
                    this.warText.setVisible(false);
                    yield this.gameManager.revealFinalWarCards(this.sprites);
                }));
            }
            this.inProgress.finalCard = false;
        });
    }
    showWarAnimation(oldSprites) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.sounds.get("war")) === null || _a === void 0 ? void 0 : _a.play();
            this.warText = this.add.text(412, 550, '', { font: '18px Arial', color: '#ff0' }).setVisible(false).setOrigin(0.5);
            this.updateUI("War!");
            this.toggleBackground(true);
            this.sprites = oldSprites;
            this.gameManager.state = GameState.THREE_CARDS;
            this.cardsIndex = 0;
            yield this.playerThreeCards();
        });
    }
    showWarResult(winner) {
        var _a, _b;
        const playerWinPhrases = [
            "You've conquered the war!",
            "Victory is yours in this epic war!",
            "You are very lucky today!"
        ];
        const aiWinPhrases = [
            "The AI emerges victorious from the war!",
            "The AI's strategy prevails in this war!",
            "The AI will take over the world!"
        ];
        const phrases = winner === "player" ? playerWinPhrases : aiWinPhrases;
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        this.updateUI(randomPhrase);
        winner === "player" ? (_a = this.sounds.get("war-win")) === null || _a === void 0 ? void 0 : _a.play() : (_b = this.sounds.get("war-lose")) === null || _b === void 0 ? void 0 : _b.play();
    }
    backFromWar() {
        this.toggleBackground(false);
        if (!this.autoPlay) {
            this.enablePlayerInteraction(() => {
                this.playTurn();
            });
        }
        else {
            this.autoPlayTurn();
        }
    }
    drawAutoPlayButton() {
        this.autoPlayButton = this.add.graphics({ x: 70, y: 530 });
        this.autoPlayButton.fillStyle(0xA9A9A9, 1);
        this.autoPlayButton.fillCircle(0, 0, 40);
        this.autoPlayButton.setInteractive(new Phaser.Geom.Circle(0, 0, 40), Phaser.Geom.Circle.Contains)
            .on('pointerdown', () => {
            var _a;
            (_a = this.sounds.get("click")) === null || _a === void 0 ? void 0 : _a.play();
            this.toggleAutoPlay();
        }).on('pointerover', () => {
            this.game.canvas.classList.add('pointer-cursor');
        }).on('pointerout', () => {
            this.game.canvas.classList.remove('pointer-cursor');
        });
        this.autoPlayButtonText = this.add.text(70, 530, 'AUTO PLAY', { font: '14px Arial', color: '#000000' }).setOrigin(0.5);
    }
    updateAutoPlayButton() {
        this.autoPlayButton.clear();
        if (this.autoPlay) {
            this.autoPlayButton.fillStyle(0x00ff00, 1); // Green
            this.autoPlayButton.fillCircle(0, 0, 40);
            this.autoPlayButtonText.setText('TURN OFF');
        }
        else {
            this.autoPlayButton.fillStyle(0xA9A9A9, 1); // Grey
            this.autoPlayButton.fillCircle(0, 0, 40);
            this.autoPlayButtonText.setText('AUTO PLAY');
        }
    }
    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        this.updateAutoPlayButton();
        // Only if it's not in the middle of other process- turn the button
        if (this.gameManager.getState() === GameState.BATTLE && !this.inProgress.turn && !this.inProgress.autoTurn) {
            if (this.autoPlay) {
                this.autoPlayTurn();
            }
            else if (!this.autoPlay) {
                this.enablePlayerInteraction(() => this.playTurn());
            }
        }
        else if (this.gameManager.getState() === GameState.THREE_CARDS && !this.inProgress.threeCards && !this.inProgress.autoThreeCards && this.cardsIndex < 3) {
            if (this.autoPlay) {
                this.playerThreeCards();
            }
            else if (!this.autoPlay) {
                this.enablePlayerInteraction(() => this.offThreeCards());
            }
        }
        else if (this.gameManager.getState() === GameState.FINAL_CARD && !this.inProgress.finalCard && this.cardsIndex < 4) {
            this.finalCard();
        }
    }
    showEndGameScreen(playerWon, isTie) {
        var _a, _b;
        this.autoPlay = false;
        this.autoPlayButton.disableInteractive();
        this.playerDeck.disableInteractive();
        this.currentWarCardsText.setText(`AI: ${this.gameManager.aiPlayer.getDeckLength()} - You: ${this.gameManager.player.getDeckLength()}`);
        if (isTie || playerWon) {
            (_a = this.sounds.get("winner")) === null || _a === void 0 ? void 0 : _a.play();
        }
        else {
            (_b = this.sounds.get("loser")) === null || _b === void 0 ? void 0 : _b.play();
        }
        // const centerX = this.cameras.main.width / 2;
        // const centerY = this.cameras.main.height / 2;
        let message;
        if (isTie) {
            message = "It's A Tie!";
        }
        else {
            message = playerWon ? 'You Won!' : 'You Lost :-(';
        }
        const text = this.add.text(this.centerX, this.centerY, message, { fontSize: '60px', color: '#0ff' }).setOrigin(0.5); // Cyan
        const replayButton = this.add.text(this.centerX, this.centerY + 45, 'Play Again', { fontSize: '32px', color: '#ff0' }) // Yellow
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
            var _a;
            (_a = this.sounds.get("restart")) === null || _a === void 0 ? void 0 : _a.play();
            this.scene.restart();
        }).on('pointerover', () => {
            this.game.canvas.classList.add('pointer-cursor');
        }).on('pointerout', () => {
            this.game.canvas.classList.remove('pointer-cursor');
        });
        // Animation
        this.tweens.add({
            targets: [text, replayButton],
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            duration: 800
        });
    }
}
/* END OF COMPILED CODE */ 
