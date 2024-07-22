import { isContext } from "vm";
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
 * 
 */
export class GameManager {
    private scene: MainScene;
    private deck: Deck;
    private player: Player;
    private aiPlayer: Player;
    private state: GameState;

    constructor(i_Scene: MainScene) {
        this.scene = i_Scene;
        this.deck = new Deck(this.scene);
        this.player = new Player(false, this.scene.playerDeck);
        this.aiPlayer = new Player(true, this.scene.aiDeck);
        this.state = GameState.DEALING;
    }

    startGame(): void {
        this.deck.shuffle();
        this.dealCards();
        this.scene.dealCards();
        this.state = GameState.BATTLE;
        this.scene.updateUI("Battle!");
    }

    private dealCards(): void {
        for (let i = 0; i < 26; i++) {
            this.player.addCard(this.deck.deal()!);
            this.aiPlayer.addCard(this.deck.deal()!);
        }
    }

    async playTurn(): Promise<void> {
        if (this.state !== GameState.BATTLE) return;

        const playerCard = this.player.playCard();
        const aiCard = this.aiPlayer.playCard();

        if (!playerCard || !aiCard) {
            this.endGame();
            return;
        }
        await this.scene.revealCard(playerCard, 340, 393);
        await this.scene.revealCard(aiCard, 464.8718390723502, 203);
        await this.scene.delay(700);

        if (playerCard.getRank() > aiCard.getRank()) {
            this.scene.updateUI("You won the battle!");
            this.player.addCards([playerCard, aiCard]);
            await this.scene.moveCardsToWinner(this.scene.playerDeck, [playerCard.getSprite(), aiCard.getSprite()]);
        } else if (playerCard.getRank() < aiCard.getRank()) {
            this.scene.updateUI("AI won the battle!");
            this.aiPlayer.addCards([playerCard, aiCard]);
            await this.scene.moveCardsToWinner(this.scene.aiDeck, [playerCard.getSprite(), aiCard.getSprite()]);
        } else {
            await this.startWar([playerCard, aiCard]);
        }

        this.checkGameOver();
    }

    private async startWar(warCards: Card[]): Promise<void> {
        this.state = GameState.WAR;
        this.scene.updateUI("War!");
        await this.scene.showWarAnimation(warCards);

        // Each player adds 3 hidden cards
        for (let i = 0; i < 3; i++) {
            const playerCard = this.player.playCard();
            const aiCard = this.aiPlayer.playCard();
            if (playerCard && aiCard) {
                warCards.push(playerCard, aiCard);
            } else {
                // If either player runs out of cards during war, end the game
                this.endGame();
                return;
            }
        }

        // Add one more card each for the final battle
        const playerFinalCard = this.player.playCard();
        const aiFinalCard = this.aiPlayer.playCard();

        if (playerFinalCard && aiFinalCard) {
            warCards.push(playerFinalCard, aiFinalCard);

            // Reveal the final cards
            await this.scene.revealCard(playerFinalCard, 340, 393);
            await this.scene.revealCard(aiFinalCard, 464.8718390723502, 203);
            await this.scene.delay(1000); // Wait 1 second

            // Determine the winner
            if (playerFinalCard.getRank() > aiFinalCard.getRank()) {
                this.player.addCards(warCards);
                await this.scene.moveCardsToWinner(this.scene.playerDeck, warCards.map(card => card.getSprite()));
                this.showWarResult("player");
            } else if (playerFinalCard.getRank() < aiFinalCard.getRank()) {
                this.aiPlayer.addCards(warCards);
                await this.scene.moveCardsToWinner(this.scene.aiDeck, warCards.map(card => card.getSprite()));
                this.showWarResult("ai");
            } else {
                // If it's another tie, start another war
                await this.startWar(warCards);
                return;
            }
        } else {
            // If either player runs out of cards during war, end the game
            this.endGame();
            return;
        }

        this.state = GameState.BATTLE;
        this.checkGameOver();
    }

    private showWarResult(winner: "player" | "ai"): void {
        const playerWinPhrases = [
            "You've conquered the war!",
            "Victory is yours in this epic battle!",
            "Your cards reign supreme in this war!"
        ];
        const aiWinPhrases = [
            "The AI emerges victorious from the war!",
            "Your opponent has won this fierce battle!",
            "The AI's strategy prevails in this war!"
        ];

        const phrases = winner === "player" ? playerWinPhrases : aiWinPhrases;
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

        this.scene.updateUI(randomPhrase);
    }

    private checkGameOver(): void {
        if (this.player.getDeckSize() === 0 || this.aiPlayer.getDeckSize() === 0) {
            this.endGame();
        }
    }

    private endGame(): void {
        this.state = GameState.GAME_OVER;
        const winner = this.player.getDeckSize() > 0 ? "You win!" : "AI wins!";
        //
        this.scene.updateUI(winner);
        this.scene.showEndGameScreen(this.player.getDeckSize() > 0);
    }

    getState(): GameState {
        return this.state;
    }
}