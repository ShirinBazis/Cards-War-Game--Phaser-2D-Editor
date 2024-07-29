import MainScene from "../Scenes/MainScene.js";
import { Card } from './Card.js';
import { Deck } from './Deck.js';
import { Player } from './Player.js';

export enum GameState {
    DEALING,
    BATTLE,
    WAR,
    GAME_OVER
}

/**
 * Use this class for main implementation.
 */
export class GameManager {
    private scene: MainScene;
    private deck: Deck;
    player: Player;
    aiPlayer: Player;
    private state: GameState;

    constructor(i_Scene: MainScene) {
        this.scene = i_Scene;
        this.deck = new Deck(this.scene);
        this.player = new Player(false, this.scene.playerDeck);
        this.aiPlayer = new Player(true, this.scene.aiDeck);
        this.state = GameState.DEALING;
    }

    private dealCards(): void {
        for (let i = 0; i < 26; i++) {
            this.player.addCard(this.deck.deal()!);
            this.aiPlayer.addCard(this.deck.deal()!);
        }
    }

    async startGame(): Promise<void> {
        return new Promise(async (resolve) => {
            this.scene.shuffleSound.play();
            this.deck.shuffle();
            this.dealCards();
            await this.scene.dealCards();
            this.state = GameState.BATTLE;
            this.scene.updateUI("Battle!");
            resolve();
        });
    }

    getState(): GameState {
        return this.state;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async playTurn(): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.state !== GameState.BATTLE) {
                resolve();
                return;
            }
            const playerCard = this.player.playCard();
            const aiCard = this.aiPlayer.playCard();
            if (!playerCard || !aiCard) {
                await this.endGame();
                resolve();
                return;
            }
            const playerCardSprite = await this.scene.revealCard(playerCard, this.scene.playerDeckSize.x, this.scene.playerDeckSize.y);
            const aiCardSprite = await this.scene.revealCard(aiCard, this.scene.aiDeckSize.x, this.scene.aiDeckSize.y);
            await this.delay(500);
            const playerRank = Math.floor(playerCard.getSymbol() / 4);
            const aiRank = Math.floor(aiCard.getSymbol() / 4);
            if (playerRank > aiRank) {
                this.scene.updateUI("You won the battle!");
                this.scene.battleWinSound.play();
                this.player.addCards([playerCard, aiCard]);
                await this.scene.moveCardsToWinner(this.scene.playerDeck, [playerCardSprite, aiCardSprite]);
            }
            else if (playerRank < aiRank) {
                this.scene.updateUI("AI won the battle!");
                this.scene.battleLoseSound.play();
                this.aiPlayer.addCards([playerCard, aiCard]);
                await this.scene.moveCardsToWinner(this.scene.aiDeck, [playerCardSprite, aiCardSprite]);
            }
            else {
                await this.startWar([playerCard, aiCard], [playerCardSprite, aiCardSprite]);
            }
            resolve();
        });
    }

    async startWar(warCards: Card[], sprites: Phaser.GameObjects.Image[]): Promise<void> {
        this.state = GameState.WAR;
        if (this.player.getDeckLength() < 4 || this.aiPlayer.getDeckLength() < 4) {
            this.scene.updateUI("Not enough cards for a war")
            await this.endGame();
            return;
        }
        // Each player adds 3 hidden cards
        for (let i = 0; i < 3; i++) {
            const playerCard = this.player.playCard();
            const aiCard = this.aiPlayer.playCard();
            if (playerCard && aiCard) {
                warCards.push(playerCard, aiCard);
            }
        }
        await this.scene.showWarAnimation(warCards, sprites);
    }

    async WarBattle(warCards: Card[], sprites: Phaser.GameObjects.Image[]): Promise<void> {
        return new Promise<void>((resolve) => {
            let isRevealing = false;
            const autoRevealCards = async () => {
                this.scene.warText.setVisible(false);
                if (isRevealing) return;
                isRevealing = true;
                this.scene.playerDeck.disableInteractive();
                await this.revealFinalWarCards(warCards, sprites);
                resolve();
            };
            const checkAutoPlay = () => {
                if (this.scene.autoPlay) {
                    autoRevealCards();
                } else {
                    this.scene.playerDeck.disableInteractive();
                    this.scene.warText.setText("Add final card").setVisible(true);
                    this.scene.enablePlayerInteraction(() => {
                        autoRevealCards();
                    });
                }
            };
            checkAutoPlay();
            // Interval to check for autoPlay changes, every 100ms
            const intervalId = setInterval(() => {
                if (this.scene.autoPlay && !isRevealing) {
                    clearInterval(intervalId);
                    checkAutoPlay();
                }
            }, 100);
        });
    }

    private async revealFinalWarCards(warCards: Card[], sprites: Phaser.GameObjects.Image[]): Promise<void> {
        this.scene.playerDeck.disableInteractive();
        // Add one more card each for the final battle
        const playerFinalCard = this.player.playCard();
        const aiFinalCard = this.aiPlayer.playCard();
        if (playerFinalCard && aiFinalCard) {
            warCards.push(playerFinalCard, aiFinalCard);
            // Reveal the final cards
            const playerCardSprite = await this.scene.revealCard(playerFinalCard, this.scene.playerDeckSize.x, this.scene.playerDeckSize.y);
            const aiCardSprite = await this.scene.revealCard(aiFinalCard, this.scene.aiDeckSize.x, this.scene.aiDeckSize.y);
            sprites.push(playerCardSprite, aiCardSprite);
            await this.delay(500);
            // Determine the winner
            const playerRank = Math.floor(playerFinalCard.getSymbol() / 4);
            const aiRank = Math.floor(aiFinalCard.getSymbol() / 4);
            if (playerRank > aiRank) {
                this.player.addCards(warCards);
                await this.scene.moveCardsToWinner(this.scene.playerDeck, sprites);
                this.scene.showWarResult("player");
            } else if (playerRank < aiRank) {
                this.aiPlayer.addCards(warCards);
                await this.scene.moveCardsToWinner(this.scene.aiDeck, sprites);
                this.scene.showWarResult("ai");
            } else {
                // If it's tie again, start another war
                await this.startWar(warCards, sprites);
                return;
            }
        } else {
            // If either player runs out of cards during war, end the game
            await this.endGame();
            return;
        }
        const gameOver = await this.checkGameOver();
        if (!gameOver) {
            this.scene.toggleBackground(false);
            this.state = GameState.BATTLE;
        }
    }

    private checkGameOver(): Promise<boolean> {
        return new Promise(async (resolve) => {
            if (this.player.getDeckLength() !== 0 && this.aiPlayer.getDeckLength() !== 0) {
                resolve(false);
                return;
            } else {
                await this.endGame();
                resolve(true);
            }
        })
    }

    private async endGame(): Promise<void> {
        this.state = GameState.GAME_OVER;
        // If it's war and both players don't have enough cards and have the same amount, or it's 0-0
        const isTie = this.player.getDeckLength() == this.aiPlayer.getDeckLength();
        // If it's war and both players don't have enough cards, the one with more cards is the winner,
        // Or the one with more then 0 cards in a regular battle
        const isPlayerWin = this.player.getDeckLength() > this.aiPlayer.getDeckLength();
        this.scene.showEndGameScreen(isPlayerWin, isTie);
    }
}