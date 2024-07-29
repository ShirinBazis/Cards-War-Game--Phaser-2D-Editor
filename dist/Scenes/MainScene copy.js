var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GameState } from '../Scripts/GameManager.js';
export default class MainScene extends Phaser.Scene {
    constructor() {
        super("MainScene");
        this.autoPlay = false;
        this.autoPlayInProgress = false;
    }
    editorCreate() {
        this.playerDeckSize = { x: 340, y: 393 };
        this.aiDeckSize = { x: 464.8718390723502, y: 203 };
        // bg
        const bg = this.add.image(408, 301, "bg");
        bg.scaleX = 1.5;
        bg.scaleY = 1.7;
        // symbols_layer
        const symbols_layer = this.add.layer();
        // black_back
        const black_back = this.add.image(this.playerDeckSize.x, this.aiDeckSize.y, "symbol_back", "back_black");
        black_back.scaleX = 1.17;
        black_back.scaleY = 1.17;
        symbols_layer.add(black_back);
        // red_back
        const red_back = this.add.image(this.aiDeckSize.x, this.playerDeckSize.y, "symbol_back", "back_red");
        red_back.scaleX = 1.17;
        red_back.scaleY = 1.17;
        symbols_layer.add(red_back);
        this.bg = bg;
        this.events.emit("scene-awake");
        this.playerDeck = this.add.image(this.playerDeckSize.x, this.playerDeckSize.y, "symbol_back", "back_red");
        this.playerDeck.setScale(1.17);
        this.playerDeck.setVisible(false);
        this.aiDeck = this.add.image(this.aiDeckSize.x, this.aiDeckSize.y, "symbol_back", "back_black");
        this.aiDeck.setScale(1.17);
        this.aiDeck.setVisible(false);
    }
    preload() {
        this.load.pack("pack", './Assets/game_pack_sd.json');
        this.load.audio('battle-win', './Assets/sounds/battle-win.wav');
        this.load.audio('battle-lose', './Assets/sounds/battle-lose.mp3');
        this.load.audio('war-win', './Assets/sounds/war-win.mp3');
        this.load.audio('war-lose', './Assets/sounds/war-lose.mp3');
        this.load.audio('winner', './Assets/sounds/winner.mp3');
        this.load.audio('loser', './Assets/sounds/loser.mp3');
        this.load.audio('click', './Assets/sounds/click.wav');
        this.load.audio('shuffle', './Assets/sounds/shuffle-cards.mp3');
        this.load.audio('restart', './Assets/sounds/restart.wav');
    }
    create() {
        this.editorCreate();
        //this.gameManager = new GameManager(this);
        this.dealButton = this.add.text(400, 300, 'Deal', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 7.5)
            .setInteractive()
            .on('pointerdown', () => {
            this.startGame();
            this.drawAutoPlayButton();
        });
        this.battleText = this.add.text(400, 200, '', { fontSize: '32px', color: '#fff' })
            .setOrigin(0.5, 5.5)
            .setVisible(false);
        this.game.events.emit("GameCreated");
        // Sounds
        this.clickSound = this.sound.add('click');
        this.battleWinSound = this.sound.add('battle-win');
        this.battleLoseSound = this.sound.add('battle-lose');
        this.warWinSound = this.sound.add('war-win');
        this.warLoseSound = this.sound.add('war-lose');
        this.gameWinSound = this.sound.add('winner');
        this.gameLoseSound = this.sound.add('loser');
        this.shuffleSound = this.sound.add('shuffle');
        this.restartSound = this.sound.add('restart');
    }
    startGame() {
        this.gameManager.startGame();
        //this.drawAutoPlayButton();
        this.dealButton.setVisible(false);
        this.battleText.setVisible(true);
        if (!this.autoPlay) {
            this.playerDeck.setInteractive()
                .once('pointerdown', () => {
                this.clickSound.play();
                this.playTurn();
            });
        }
        else {
            this.autoPlayTurn();
        }
    }
    autoPlayTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.autoPlayInProgress)
                return;
            this.autoPlayInProgress = true;
            this.playerDeck.disableInteractive();
            while (this.autoPlay && this.gameManager.getState() === GameState.BATTLE) {
                yield this.gameManager.playTurn();
                if (!this.autoPlay)
                    break;
            }
            this.autoPlayInProgress = false;
            // if (!this.autoPlay) {
            // 	this.playTurn();
            // this.playerDeck.setInteractive()
            // 	.once('pointerdown', () => {
            // 		this.clickSound.play();
            // 		this.playTurn();
            // 	});
            //}
        });
    }
    playTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            this.battleText.setVisible(false);
            this.playerDeck.disableInteractive();
            if (this.gameManager.getState() === GameState.BATTLE) {
                if (this.autoPlay) {
                    //this.autoPlayTurn();
                    return;
                }
                else {
                    yield this.gameManager.playTurn();
                }
            }
            if (!this.autoPlay) {
                this.playerDeck.setInteractive()
                    .once('pointerdown', () => {
                    this.clickSound.play();
                    this.playTurn();
                });
            }
            console.log(this.autoPlay);
        });
    }
    updateUI(message) {
        this.battleText.setText(message).setVisible(true);
    }
    dealCardAnimation(startX, startY, frame, targetDeck, index) {
        return new Promise((resolve) => {
            const card = this.add.image(startX, startY, "symbol_back", frame).setScale(1.17);
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
                animations.push(this.dealCardAnimation(centerX, centerY, "back_black", this.aiDeck, i));
            }
            return Promise.all(animations).then(() => {
                this.playerDeck.setVisible(true);
                this.aiDeck.setVisible(true);
            });
        });
    }
    revealCard(card, x, y) {
        return new Promise((resolve) => {
            const cardSprite = this.add.image(x, y, "symbols", `symbol_${card.getSymbol()}`).setScale(0.45);
            this.tweens.add({
                targets: cardSprite,
                scaleX: 0,
                duration: 250,
                onComplete: () => {
                    this.tweens.add({
                        targets: cardSprite,
                        scaleX: 0.45,
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
                            resolve();
                        }
                    }
                });
            });
        });
    }
    showFaceDownCardPair(index, cardArray) {
        return new Promise((resolve) => {
            const playerCard = this.add.image(this.playerDeckSize.x, this.playerDeckSize.y - (index * 10), 'symbol_back', 'back_red').setScale(1.17);
            const aiCard = this.add.image(this.aiDeckSize.x, this.aiDeckSize.y - (index * 10), 'symbol_back', 'back_black').setScale(1.17);
            cardArray.push(playerCard, aiCard);
            this.tweens.add({
                targets: [playerCard, aiCard],
                alpha: 1,
                duration: 300,
                delay: index * 200,
                onComplete: () => resolve()
            });
        });
    }
    showWarAnimation() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.updateUI("War!");
            const faceDownCards = [];
            for (let i = 0; i < 3; i++) {
                yield this.showFaceDownCardPair(i, faceDownCards);
            }
            yield this.delay(1000);
            resolve(faceDownCards);
        }));
    }
    showEndGameScreen(playerWon) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const message = playerWon ? 'You Won!' : 'You Lost :-(';
        const text = this.add.text(centerX, centerY - 50, message, { fontSize: '60px', color: '#0ff' }).setOrigin(0.5);
        const replayButton = this.add.text(centerX, centerY + 50, 'Play Again', { fontSize: '32px', color: '#ff0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
            this.restartSound.play();
            this.scene.restart();
        });
        this.tweens.add({
            targets: [text, replayButton],
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: -1,
            duration: 800
        });
        playerWon ? this.gameWinSound.play() : this.gameLoseSound.play();
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // Draw the auto-play button
    drawAutoPlayButton() {
        this.autoPlayButton = this.add.graphics({ x: 100, y: 500 });
        this.autoPlayButton.fillStyle(0x00ff00, 1);
        this.autoPlayButton.fillCircle(0, 0, 40);
        this.autoPlayButton.setInteractive(new Phaser.Geom.Circle(0, 0, 40), Phaser.Geom.Circle.Contains)
            .on('pointerdown', () => {
            this.clickSound.play();
            this.toggleAutoPlay();
        });
        this.autoPlayButtonText = this.add.text(100, 500, 'AUTO-PLAY', { fontSize: '14px', color: '#000000' }).setOrigin(0.5);
        this.updateAutoPlayButton();
    }
    updateAutoPlayButton() {
        this.autoPlayButton.clear();
        if (this.autoPlay) {
            this.autoPlayButton.fillStyle(0xff0000, 1); // Red color
            this.autoPlayButton.fillCircle(0, 0, 40);
            this.autoPlayButtonText.setText('OFF');
        }
        else {
            this.autoPlayButton.fillStyle(0x00ff00, 1); // Green color
            this.autoPlayButton.fillCircle(0, 0, 40);
            this.autoPlayButtonText.setText('AUTO-PLAY');
        }
    }
    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        this.updateAutoPlayButton();
        if (this.gameManager.getState() === GameState.BATTLE) {
            if (this.autoPlay && !this.autoPlayInProgress) {
                this.autoPlayTurn();
            }
            else {
                //if (!this.autoPlayInProgress) {
                // this.playerDeck.setInteractive()
                // 	.once('pointerdown', () => {
                // 		this.clickSound.play();
                this.playTurn();
                //});
                //}
                // this.playerDeck.setInteractive();
                // if (this.gameManager.isPlayerTurn() && !this.autoPlayInProgress) {
                //	this.playTurn();
                //}
            }
        }
    }
}
/* END OF COMPILED CODE */ 
