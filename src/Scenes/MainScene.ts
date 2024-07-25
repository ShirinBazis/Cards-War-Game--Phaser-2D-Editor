/// <reference path="../../node_modules/phaser/types/phaser.d.ts"/>
/* START OF COMPILED CODE */
import { Card } from '../Scripts/Card.js';
import { GameManager, GameState } from '../Scripts/GameManager.js';

interface DeckSize {
    x: number;
    y: number;
}

export default class MainScene extends Phaser.Scene {
	private gameManager!: GameManager;
	private dealButton!: Phaser.GameObjects.Text;
	private battleText!: Phaser.GameObjects.Text;
	playerDeck!: Phaser.GameObjects.Image;
	aiDeck!: Phaser.GameObjects.Image;
	private bg!: Phaser.GameObjects.Image;
	playerDeckSize! : DeckSize;
	aiDeckSize! : DeckSize;
	clickSound!: Phaser.Sound.BaseSound;
	battleWinSound!: Phaser.Sound.BaseSound;
	battleLoseSound!: Phaser.Sound.BaseSound;
	warWinSound!: Phaser.Sound.BaseSound;
	warLoseSound!: Phaser.Sound.BaseSound;
	private gameWinSound!: Phaser.Sound.BaseSound;
	private gameLoseSound!: Phaser.Sound.BaseSound;
	shuffleSound!: Phaser.Sound.BaseSound;
	private restartSound!: Phaser.Sound.BaseSound;
	

	constructor() {
		super("MainScene");
	}

	editorCreate(): void {
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
		this.gameManager = new GameManager(this);

		this.dealButton = this.add.text(400, 300, 'Deal', { fontSize: '32px', color: '#fff' })
			.setOrigin(0.5, 7.5)
			.setInteractive()
			.on('pointerdown', () => this.startGame());

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

	private startGame(): void {
		this.gameManager.startGame();
		this.dealButton.setVisible(false);
		this.battleText.setVisible(true);
		this.playerDeck.setInteractive()
			.once('pointerdown', () => {
				this.clickSound.play();
				this.playTurn();
			})
	}

	playTurn(): void {
		this.battleText.setVisible(false);
		this.playerDeck.disableInteractive();
		if (this.gameManager.getState() === GameState.BATTLE) {
			this.gameManager.playTurn();
		}
	}

	updateUI(message: string): void {
		this.battleText.setText(message).setVisible(true);
	}

	private dealCardAnimation(startX: number, startY: number, frame: string, targetDeck: Phaser.GameObjects.Image, index: number): Promise<void> {
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

	async dealCards(): Promise<void> {
		const centerX = this.cameras.main.width / 2;
		const centerY = this.cameras.main.height / 2;
		const animations: Promise<void>[] = [];
		for (let i = 0; i < 26; i++) {
			animations.push(this.dealCardAnimation(centerX, centerY, "back_red", this.playerDeck, i));
			animations.push(this.dealCardAnimation(centerX, centerY, "back_black", this.aiDeck, i));
		}
		return Promise.all(animations).then(() => {
			this.playerDeck.setVisible(true);
			this.aiDeck.setVisible(true);
		});
	}

	revealCard(card: Card, x: number, y: number): Promise<Phaser.GameObjects.Image> {
		return new Promise((resolve) => {
			const cardSprite = this.add.image(x, y, "symbols", `symbol_${card.getSymbolNumber()}`).setScale(0.45);
			this.tweens.add({
				targets: cardSprite,
				scaleX: 0,
				duration: 250, // Duration for hiding effect
				onComplete: () => {
					this.tweens.add({
						targets: cardSprite,
						scaleX: 0.45,
						duration: 250, // Duration for showing effect
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

	moveCardsToWinner(winnerDeck: Phaser.GameObjects.Image, cards: Phaser.GameObjects.Image[]): Promise<void> {
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

	private showFaceDownCardPair(index: number, cardArray: Phaser.GameObjects.Image[]): Promise<void> {
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

	showWarAnimation(): Promise<Phaser.GameObjects.Image[]> {
		return new Promise(async (resolve) => {
			this.updateUI("War!")
			const faceDownCards: Phaser.GameObjects.Image[] = [];
			for (let i = 0; i < 3; i++) {
				await this.showFaceDownCardPair(i, faceDownCards);
			}
			await this.delay(1000);
			resolve(faceDownCards);
		});
	}

	showEndGameScreen(playerWon: boolean): void {
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

	delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
/* END OF COMPILED CODE */