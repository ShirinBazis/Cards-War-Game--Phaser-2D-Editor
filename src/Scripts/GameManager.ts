import MainScene from "../Scenes/MainScene.js";
import { Card } from './Card.js';
import { Deck } from './Deck.js';
import { Player } from './Player.js';

export enum GameState {
    DEALING,
    BATTLE,
    WAR,
    THREE_CARDS,
    FINAL_CARD,
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
    state: GameState;
    private warCards: Card[];

    constructor(i_Scene: MainScene) {
        this.scene = i_Scene;
        this.deck = new Deck(this.scene);
        this.player = new Player();
        this.aiPlayer = new Player();
        this.state = GameState.DEALING;
        this.warCards = []
    }

    private dealCards(): void {
        for (let i = 0; i < 26; i++) {
            this.player.addCard(this.deck.deal()!);
            this.aiPlayer.addCard(this.deck.deal()!);
        }
    }

    async startGame(): Promise<void> {
        this.deck.shuffle();
        this.dealCards();
        await this.scene.dealCards();
        this.state = GameState.BATTLE;
        this.scene.updateUI("Battle!");
    }

    getState(): GameState {
        return this.state;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async playTurn(): Promise<void> {
        if (this.state !== GameState.BATTLE) {
            return;
        }
        const playerCard = this.player.playCard();
        const aiCard = this.aiPlayer.playCard();
        // If one of the players has no cards
        if (!playerCard || !aiCard) {
            this.endGame();
            return;
        }
        const playerCardSprite = await this.scene.revealCard(playerCard, true);
        const aiCardSprite = await this.scene.revealCard(aiCard);
        await this.delay(500);
        const playerRank = Math.floor(playerCard.getSymbol() / 4);
        const aiRank = Math.floor(aiCard.getSymbol() / 4);
        // Player wins
        if (playerRank > aiRank) {
            this.scene.updateUI("You won the battle!");
            this.scene.sounds.get("battle-win")?.play();
            this.player.addCards([playerCard, aiCard]);
            await this.scene.moveCardsToWinner(this.scene.playerDeck, [playerCardSprite, aiCardSprite]);
        }
        // AI wins
        else if (playerRank < aiRank) {
            this.scene.updateUI("AI won the battle!");
            this.scene.sounds.get("battle-lose")?.play();
            this.aiPlayer.addCards([playerCard, aiCard]);
            await this.scene.moveCardsToWinner(this.scene.aiDeck, [playerCardSprite, aiCardSprite]);
        }
        // War
        else {
            this.warCards.push(playerCard, aiCard);
            await this.startWar([playerCardSprite, aiCardSprite]);
        }
    }

    private async startWar(sprites: Phaser.GameObjects.Image[]): Promise<void> {
        this.state = GameState.WAR;
        if (this.player.getDeckLength() < 4 || this.aiPlayer.getDeckLength() < 4) {
            this.scene.updateUI("Not enough cards for a war")
            this.endGame();
            return;
        }
        // Each player adds 3 hidden cards
        for (let i = 0; i < 3; i++) {
            const playerCard = this.player.playCard();
            const aiCard = this.aiPlayer.playCard();
            if (playerCard && aiCard) {
                this.warCards.push(playerCard, aiCard);
            }
        }
        await this.scene.showWarAnimation(sprites);
    }

    async revealFinalWarCards(sprites: Phaser.GameObjects.Image[]): Promise<void> {
        this.scene.playerDeck.disableInteractive();
        // Add one more card each for the final battle
        const playerFinalCard = this.player.playCard();
        const aiFinalCard = this.aiPlayer.playCard();
        if (playerFinalCard && aiFinalCard) {
            this.warCards.push(playerFinalCard, aiFinalCard);
            // Reveal the final cards
            const playerCardSprite = await this.scene.revealCard(playerFinalCard, true);
            const aiCardSprite = await this.scene.revealCard(aiFinalCard);
            sprites.push(playerCardSprite, aiCardSprite);
            await this.delay(500);
            // Determine the winner
            const playerRank = Math.floor(playerFinalCard.getSymbol() / 4);
            const aiRank = Math.floor(aiFinalCard.getSymbol() / 4);
            if (playerRank > aiRank) {
                this.player.addCards(this.warCards);
                await this.scene.moveCardsToWinner(this.scene.playerDeck, sprites);
                this.scene.showWarResult("player");
            } else if (playerRank < aiRank) {
                this.aiPlayer.addCards(this.warCards);
                await this.scene.moveCardsToWinner(this.scene.aiDeck, sprites);
                this.scene.showWarResult("ai");
            } else {
                // If it's tie again, start another war
                await this.startWar(sprites);
                return;
            }
        } else {
            // If either player runs out of cards during war, end the game
            this.endGame();
            return;
        }
        const gameOver = this.checkGameOver();
        if (!gameOver) {
            this.state = GameState.BATTLE;
            this.warCards = [];
            this.scene.backFromWar();
        }
    }

    private checkGameOver(): boolean {
        if (this.player.getDeckLength() !== 0 && this.aiPlayer.getDeckLength() !== 0) {
            return false;
        } else {
            this.endGame();
            return true;
        }
    }

    private endGame(): void {
        this.state = GameState.GAME_OVER;
        // If it's war and both players don't have enough cards and have the same amount, or it's 0-0
        const isTie = this.player.getDeckLength() == this.aiPlayer.getDeckLength();
        // If it's war and both players don't have enough cards, the one with more cards is the winner,
        // Or the one with more then 0 cards in a regular battle
        const isPlayerWin = this.player.getDeckLength() > this.aiPlayer.getDeckLength();
        this.scene.showEndGameScreen(isPlayerWin, isTie);
    }
}