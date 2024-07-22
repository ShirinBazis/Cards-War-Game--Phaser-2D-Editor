var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Deck } from './Deck.js';
import { Player } from './Player.js';
export var GameState;
(function (GameState) {
    GameState[GameState["DEALING"] = 0] = "DEALING";
    GameState[GameState["BATTLE"] = 1] = "BATTLE";
    GameState[GameState["WAR"] = 2] = "WAR";
    GameState[GameState["GAME_OVER"] = 3] = "GAME_OVER";
})(GameState || (GameState = {}));
/**
 * Use this class for main implementation.
 *
 */
export class GameManager {
    constructor(i_Scene) {
        this.scene = i_Scene;
        this.deck = new Deck(this.scene);
        this.player = new Player(false, this.scene.playerDeck);
        this.aiPlayer = new Player(true, this.scene.aiDeck);
        this.state = GameState.DEALING;
    }
    startGame() {
        this.deck.shuffle();
        this.dealCards();
        this.scene.dealCards();
        this.state = GameState.BATTLE;
        this.scene.updateUI("Battle!");
    }
    dealCards() {
        for (let i = 0; i < 26; i++) {
            this.player.addCard(this.deck.deal());
            this.aiPlayer.addCard(this.deck.deal());
        }
    }
    playTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state !== GameState.BATTLE)
                return;
            const playerCard = this.player.playCard();
            const aiCard = this.aiPlayer.playCard();
            if (!playerCard || !aiCard) {
                this.endGame();
                return;
            }
            yield this.scene.revealCard(playerCard, 340, 393);
            yield this.scene.revealCard(aiCard, 464.8718390723502, 203);
            yield this.scene.delay(700);
            if (playerCard.getRank() > aiCard.getRank()) {
                this.scene.updateUI("You won the battle!");
                this.player.addCards([playerCard, aiCard]);
                yield this.scene.moveCardsToWinner(this.scene.playerDeck, [playerCard.getSprite(), aiCard.getSprite()]);
            }
            else if (playerCard.getRank() < aiCard.getRank()) {
                this.scene.updateUI("AI won the battle!");
                this.aiPlayer.addCards([playerCard, aiCard]);
                yield this.scene.moveCardsToWinner(this.scene.aiDeck, [playerCard.getSprite(), aiCard.getSprite()]);
            }
            else {
                yield this.startWar([playerCard, aiCard]);
            }
            this.checkGameOver();
        });
    }
    startWar(warCards) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = GameState.WAR;
            this.scene.updateUI("War!");
            yield this.scene.showWarAnimation(warCards);
            // Each player adds 3 hidden cards
            for (let i = 0; i < 3; i++) {
                const playerCard = this.player.playCard();
                const aiCard = this.aiPlayer.playCard();
                if (playerCard && aiCard) {
                    warCards.push(playerCard, aiCard);
                }
                else {
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
                yield this.scene.revealCard(playerFinalCard, 340, 393);
                yield this.scene.revealCard(aiFinalCard, 464.8718390723502, 203);
                yield this.scene.delay(1000); // Wait 1 second
                // Determine the winner
                if (playerFinalCard.getRank() > aiFinalCard.getRank()) {
                    this.player.addCards(warCards);
                    yield this.scene.moveCardsToWinner(this.scene.playerDeck, warCards.map(card => card.getSprite()));
                    this.showWarResult("player");
                }
                else if (playerFinalCard.getRank() < aiFinalCard.getRank()) {
                    this.aiPlayer.addCards(warCards);
                    yield this.scene.moveCardsToWinner(this.scene.aiDeck, warCards.map(card => card.getSprite()));
                    this.showWarResult("ai");
                }
                else {
                    // If it's another tie, start another war
                    yield this.startWar(warCards);
                    return;
                }
            }
            else {
                // If either player runs out of cards during war, end the game
                this.endGame();
                return;
            }
            this.state = GameState.BATTLE;
            this.checkGameOver();
        });
    }
    showWarResult(winner) {
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
    checkGameOver() {
        if (this.player.getDeckSize() === 0 || this.aiPlayer.getDeckSize() === 0) {
            this.endGame();
        }
    }
    endGame() {
        this.state = GameState.GAME_OVER;
        const winner = this.player.getDeckSize() > 0 ? "You win!" : "AI wins!";
        //
        this.scene.updateUI(winner);
        this.scene.showEndGameScreen(this.player.getDeckSize() > 0);
    }
    getState() {
        return this.state;
    }
}
