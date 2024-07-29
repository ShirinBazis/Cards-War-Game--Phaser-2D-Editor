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
        this.autoPlay = false;
        this.autoPlayInProgress = false;
        this.turnInProgress = false;
    }
    preload() {
        this.load.pack("pack", './Assets/game_pack_sd.json');
        this.load.image('war', './Assets/bg/war.jpeg');
        this.load.audio('battle-win', './Assets/sounds/battle-win.wav');
        this.load.audio('battle-lose', './Assets/sounds/battle-lose.mp3');
        this.load.audio('war', './Assets/sounds/war.mp3');
        this.load.audio('war-win', './Assets/sounds/war-win.mp3');
        this.load.audio('war-lose', './Assets/sounds/war-lose.mp3');
        this.load.audio('winner', './Assets/sounds/winner.mp3');
        this.load.audio('loser', './Assets/sounds/loser.mp3');
        this.load.audio('click', './Assets/sounds/click.wav');
        this.load.audio('shuffle', './Assets/sounds/shuffle-cards.mp3');
        this.load.audio('restart', './Assets/sounds/restart.wav');
    }
    editorCreate() {
        // bg
        this.background = this.add.image(408, 301, "bg").setScale(1.7).setVisible(true);
        this.warBackground = this.add.image(408, 301, "war").setScale(1.7).setVisible(false);
        // symbols_layer
        const symbols_layer = this.add.layer();
        // main_deck
        this.deck = this.add.image(400, 300, "symbol_back", "back_red").setScale(1.1);
        symbols_layer.add(this.deck);
        this.dealButton = this.add.text(400, 300, 'Deal', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 7.5)
            .setInteractive()
            .on('pointerdown', () => {
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
        this.editorCreate();
        this.playerDeckSize = { x: 500, y: 450 };
        this.aiDeckSize = { x: 300, y: 200 };
        this.gameManager = new GameManager(this);
        this.battleText = this.add.text(400, 200, '', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 5.5)
            .setVisible(false);
        this.currentCardsText = this.add.text(580, 100, '', {
            font: 'bold 18px Arial',
            color: '#000000',
        }).setVisible(false);
        this.playerDeck = this.add.image(this.playerDeckSize.x, this.playerDeckSize.y, "symbol_back", "back_red");
        this.playerDeck.setScale(1.1);
        this.playerDeck.setVisible(false);
        this.aiDeck = this.add.image(this.aiDeckSize.x, this.aiDeckSize.y, "symbol_back", "back_red");
        this.aiDeck.setScale(1.1);
        this.aiDeck.setVisible(false);
        this.game.events.emit("GameCreated");
        // Sounds
        this.clickSound = this.sound.add('click');
        this.battleWinSound = this.sound.add('battle-win');
        this.battleLoseSound = this.sound.add('battle-lose');
        this.warSound = this.sound.add('war');
        this.warWinSound = this.sound.add('war-win');
        this.warLoseSound = this.sound.add('war-lose');
        this.gameWinSound = this.sound.add('winner');
        this.gameLoseSound = this.sound.add('loser');
        this.shuffleSound = this.sound.add('shuffle');
        this.restartSound = this.sound.add('restart');
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
    updateUI(message) {
        this.battleText.setText(message).setVisible(true);
    }
    dealCardAnimation(startX, startY, frame, targetDeck, index) {
        return new Promise((resolve) => {
            const card = this.add.image(startX, startY, "symbol_back", frame).setScale(1.1);
            this.tweens.add({
                targets: card,
                x: targetDeck.x,
                y: targetDeck.y,
                duration: 300,
                delay: index * 50,
                onComplete: () => {
                    card.destroy();
                    resolve();
                }
            });
        });
    }
    dealCards() {
        return __awaiter(this, void 0, void 0, function* () {
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height / 2;
            const animations = [];
            for (let i = 0; i < 26; i++) {
                animations.push(this.dealCardAnimation(centerX, centerY, "back_red", this.playerDeck, i));
                animations.push(this.dealCardAnimation(centerX, centerY, "back_red", this.aiDeck, i));
            }
            this.deck.setVisible(false);
            return Promise.all(animations).then(() => {
                this.playerDeck.setVisible(true);
                this.aiDeck.setVisible(true);
                this.currentCardsText.setText(`AI: ${this.gameManager.aiPlayer.getDeckLength()} - You: ${this.gameManager.player.getDeckLength()}`).setVisible(true);
            });
        });
    }
    revealCard(card, x, y) {
        return new Promise((resolve) => {
            const cardSprite = this.add.image(x, y, "symbols", `symbol_${card.getSymbol()}`).setScale(0.4);
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
    moveCardsToWinner(winnerDeck, cards) {
        return new Promise((resolve) => {
            let completedCount = 0;
            cards.forEach((card) => {
                this.tweens.add({
                    targets: card,
                    x: winnerDeck.x,
                    y: winnerDeck.y,
                    duration: 400,
                    delay: 100,
                    onComplete: () => {
                        card.destroy();
                        completedCount++;
                        if (completedCount === cards.length) {
                            this.currentCardsText.setText(`AI: ${this.gameManager.aiPlayer.getDeckLength()} - You: ${this.gameManager.player.getDeckLength()}`);
                            resolve();
                        }
                    }
                });
            });
        });
    }
    enablePlayerInteraction(callback) {
        this.playerDeck.setInteractive()
            .once('pointerdown', () => {
            this.clickSound.play();
            callback();
        }).on('pointerover', () => {
            this.game.canvas.classList.add('pointer-cursor');
        }).on('pointerout', () => {
            this.game.canvas.classList.remove('pointer-cursor');
        });
    }
    autoPlayTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.autoPlayInProgress)
                return;
            this.autoPlayInProgress = true;
            this.playerDeck.disableInteractive();
            // Auto play loop
            while (this.autoPlay && this.gameManager.getState() === GameState.BATTLE) {
                yield this.gameManager.playTurn();
            }
            // Auto play off
            if (!this.autoPlay && this.gameManager.getState() === GameState.BATTLE) {
                this.enablePlayerInteraction(() => this.playTurn());
            }
            this.autoPlayInProgress = false;
        });
    }
    playTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.turnInProgress)
                return;
            this.turnInProgress = true;
            this.battleText.setVisible(false);
            this.playerDeck.disableInteractive();
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
            this.turnInProgress = false;
        });
    }
    toggleBackground(isWar) {
        this.background.setVisible(!isWar);
        this.warBackground.setVisible(isWar);
    }
    putBackCard(i, isPlayer = false) {
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
    showWarAnimation(warCards, sprites) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.warSound.play();
            this.warText = this.add.text(412, 550, '', { font: '18px Arial', color: '#ff0' }).setVisible(false).setOrigin(0.5);
            this.updateUI("War!");
            this.toggleBackground(true);
            // Player cards
            for (let i = 0; i < 3; i++) {
                yield new Promise((res) => {
                    let isChecking = false;
                    if (this.autoPlay) {
                        this.warText.setVisible(false);
                        this.putBackCard(i, true).then(sprite => {
                            sprites.push(sprite);
                            res();
                        });
                    }
                    else {
                        const checkAutoPlay = () => {
                            if (isChecking)
                                return;
                            isChecking = true;
                            if (this.autoPlay) {
                                this.warText.setVisible(false);
                                this.playerDeck.disableInteractive();
                                this.putBackCard(i, true).then(sprite => {
                                    sprites.push(sprite);
                                    res();
                                });
                            }
                            else {
                                this.warText.setText(`Add ${3 - i} hidden cards`).setVisible(true);
                                this.enablePlayerInteraction(() => __awaiter(this, void 0, void 0, function* () {
                                    const sprite = yield this.putBackCard(i, true);
                                    sprites.push(sprite);
                                    res();
                                }));
                            }
                            isChecking = false;
                        };
                        checkAutoPlay();
                        // Interval to check for autoPlay changes, every 100ms
                        const intervalId = setInterval(() => {
                            if (this.autoPlay && !isChecking) {
                                clearInterval(intervalId);
                                checkAutoPlay();
                            }
                        }, 100);
                    }
                });
            }
            this.warText.setVisible(false);
            // AI cards
            this.playerDeck.disableInteractive();
            for (let i = 0; i < 3; i++) {
                const sprite = yield this.putBackCard(i);
                sprites.push(sprite);
            }
            yield this.gameManager.WarBattle(warCards, sprites);
            resolve(sprites);
        }));
    }
    showWarResult(winner) {
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
        winner === "player" ? this.warWinSound.play() : this.warLoseSound.play();
        ;
    }
    drawAutoPlayButton() {
        this.autoPlayButton = this.add.graphics({ x: 70, y: 530 });
        this.autoPlayButton.fillStyle(0x00ff00, 1);
        this.autoPlayButton.fillCircle(0, 0, 40);
        this.autoPlayButton.setInteractive(new Phaser.Geom.Circle(0, 0, 40), Phaser.Geom.Circle.Contains)
            .on('pointerdown', () => {
            this.clickSound.play();
            this.toggleAutoPlay();
        }).on('pointerover', () => {
            this.game.canvas.classList.add('pointer-cursor');
        }).on('pointerout', () => {
            this.game.canvas.classList.remove('pointer-cursor');
        });
        this.autoPlayButtonText = this.add.text(70, 530, 'AUTO-PLAY', { font: '14px Arial', color: '#000000' }).setOrigin(0.5);
        this.updateAutoPlayButton();
    }
    updateAutoPlayButton() {
        this.autoPlayButton.clear();
        if (this.autoPlay) {
            this.autoPlayButton.fillStyle(0x00ff00, 1); // Red
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
        if (!this.turnInProgress && !this.autoPlayInProgress && this.gameManager.getState() === GameState.BATTLE) {
            if (this.autoPlay) {
                this.autoPlayTurn();
            }
            else if (!this.autoPlay) {
                this.enablePlayerInteraction(() => this.playTurn());
            }
        }
    }
    showEndGameScreen(playerWon, isTie) {
        this.autoPlay = false;
        this.autoPlayButton.disableInteractive();
        this.playerDeck.disableInteractive();
        this.currentCardsText.setText(`AI: ${this.gameManager.aiPlayer.getDeckLength()} - You: ${this.gameManager.player.getDeckLength()}`);
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        let message;
        if (isTie) {
            message = "It's A Tie!";
        }
        else {
            message = playerWon ? 'You Won!' : 'You Lost :-(';
        }
        const text = this.add.text(centerX, centerY, message, { fontSize: '60px', color: '#0ff' }).setOrigin(0.5); // Cyan
        const replayButton = this.add.text(centerX, centerY + 45, 'Play Again', { fontSize: '32px', color: '#ff0' }) // Yellow
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
            this.restartSound.play();
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
        if (isTie || playerWon) {
            this.gameWinSound.play();
        }
        else {
            this.gameLoseSound.play();
        }
    }
}
/* END OF COMPILED CODE */ 
