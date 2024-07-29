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
 */
export class GameManager {
    constructor(i_Scene) {
        this.scene = i_Scene;
        this.deck = new Deck(this.scene);
        this.player = new Player(false, this.scene.playerDeck);
        this.aiPlayer = new Player(true, this.scene.aiDeck);
        this.state = GameState.DEALING;
    }
    dealCards() {
        for (let i = 0; i < 26; i++) {
            this.player.addCard(this.deck.deal());
            this.aiPlayer.addCard(this.deck.deal());
        }
    }
    startGame() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            this.scene.shuffleSound.play();
            this.deck.shuffle();
            this.dealCards();
            yield this.scene.dealCards();
            this.state = GameState.BATTLE;
            this.scene.updateUI("Battle!");
            resolve();
        }));
    }
    getState() {
        return this.state;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    playTurn() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.state !== GameState.BATTLE) {
                resolve();
                return;
            }
            const playerCard = this.player.playCard();
            const aiCard = this.aiPlayer.playCard();
            // If one of the players has no cards
            if (!playerCard || !aiCard) {
                yield this.endGame();
                resolve();
                return;
            }
            const playerCardSprite = yield this.scene.revealCard(playerCard, this.scene.playerDeckSize.x, this.scene.playerDeckSize.y);
            const aiCardSprite = yield this.scene.revealCard(aiCard, this.scene.aiDeckSize.x, this.scene.aiDeckSize.y);
            yield this.delay(500);
            const playerRank = Math.floor(playerCard.getSymbol() / 4);
            const aiRank = Math.floor(aiCard.getSymbol() / 4);
            // Player wins
            if (playerRank > aiRank) {
                this.scene.updateUI("You won the battle!");
                this.scene.battleWinSound.play();
                this.player.addCards([playerCard, aiCard]);
                yield this.scene.moveCardsToWinner(this.scene.playerDeck, [playerCardSprite, aiCardSprite]);
                resolve();
            }
            // AI wins
            else if (playerRank < aiRank) {
                this.scene.updateUI("AI won the battle!");
                this.scene.battleLoseSound.play();
                this.aiPlayer.addCards([playerCard, aiCard]);
                yield this.scene.moveCardsToWinner(this.scene.aiDeck, [playerCardSprite, aiCardSprite]);
                resolve();
            }
            // War
            else {
                yield this.startWar([playerCard, aiCard], [playerCardSprite, aiCardSprite]);
                resolve();
            }
        }));
    }
    startWar(warCards, sprites) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = GameState.WAR;
            if (this.player.getDeckLength() < 4 || this.aiPlayer.getDeckLength() < 4) {
                this.scene.updateUI("Not enough cards for a war");
                yield this.endGame();
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
            yield this.scene.showWarAnimation(warCards, sprites);
        });
    }
    WarBattle(warCards, sprites) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            let isRevealing = false;
            const autoRevealCards = () => __awaiter(this, void 0, void 0, function* () {
                this.scene.warText.setVisible(false);
                if (isRevealing)
                    return;
                isRevealing = true;
                this.scene.playerDeck.disableInteractive();
                yield this.revealFinalWarCards(warCards, sprites);
                resolve();
            });
            const checkAutoPlay = () => __awaiter(this, void 0, void 0, function* () {
                if (this.scene.autoPlay) {
                    yield autoRevealCards();
                }
                else {
                    this.scene.playerDeck.disableInteractive();
                    this.scene.warText.setText("Add final card").setVisible(true);
                    this.scene.enablePlayerInteraction(() => __awaiter(this, void 0, void 0, function* () {
                        yield autoRevealCards();
                    }));
                }
            });
            yield checkAutoPlay();
            // Interval to check for autoPlay changes, every 100ms
            const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (this.scene.autoPlay && !isRevealing) {
                    clearInterval(intervalId);
                    sprites.forEach(sprite => sprite.destroy());
                    yield checkAutoPlay();
                }
            }), 100);
        }));
    }
    revealFinalWarCards(warCards, sprites) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.playerDeck.disableInteractive();
            // Add one more card each for the final battle
            const playerFinalCard = this.player.playCard();
            const aiFinalCard = this.aiPlayer.playCard();
            if (playerFinalCard && aiFinalCard) {
                warCards.push(playerFinalCard, aiFinalCard);
                // Reveal the final cards
                const playerCardSprite = yield this.scene.revealCard(playerFinalCard, this.scene.playerDeckSize.x, this.scene.playerDeckSize.y);
                const aiCardSprite = yield this.scene.revealCard(aiFinalCard, this.scene.aiDeckSize.x, this.scene.aiDeckSize.y);
                sprites.push(playerCardSprite, aiCardSprite);
                yield this.delay(500);
                // Determine the winner
                const playerRank = Math.floor(playerFinalCard.getSymbol() / 4);
                const aiRank = Math.floor(aiFinalCard.getSymbol() / 4);
                if (playerRank > aiRank) {
                    this.player.addCards(warCards);
                    yield this.scene.moveCardsToWinner(this.scene.playerDeck, sprites);
                    this.scene.showWarResult("player");
                }
                else if (playerRank < aiRank) {
                    this.aiPlayer.addCards(warCards);
                    yield this.scene.moveCardsToWinner(this.scene.aiDeck, sprites);
                    this.scene.showWarResult("ai");
                }
                else {
                    // If it's tie again, start another war
                    yield this.startWar(warCards, sprites);
                    return;
                }
            }
            else {
                // If either player runs out of cards during war, end the game
                yield this.endGame();
                return;
            }
            const gameOver = yield this.checkGameOver();
            if (!gameOver) {
                this.scene.toggleBackground(false);
                this.state = GameState.BATTLE;
            }
        });
    }
    checkGameOver() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (this.player.getDeckLength() !== 0 && this.aiPlayer.getDeckLength() !== 0) {
                resolve(false);
                return;
            }
            else {
                yield this.endGame();
                resolve(true);
            }
        }));
    }
    endGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = GameState.GAME_OVER;
            // If it's war and both players don't have enough cards and have the same amount, or it's 0-0
            const isTie = this.player.getDeckLength() == this.aiPlayer.getDeckLength();
            // If it's war and both players don't have enough cards, the one with more cards is the winner,
            // Or the one with more then 0 cards in a regular battle
            const isPlayerWin = this.player.getDeckLength() > this.aiPlayer.getDeckLength();
            this.scene.showEndGameScreen(isPlayerWin, isTie);
        });
    }
}
