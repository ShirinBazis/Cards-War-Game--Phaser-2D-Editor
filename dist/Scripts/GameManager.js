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
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                this.scene.shuffleSound.play();
                this.deck.shuffle();
                this.dealCards();
                yield this.scene.dealCards();
                this.state = GameState.BATTLE;
                this.scene.updateUI("Battle!");
                resolve();
            }));
        });
    }
    playTurn() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (this.state !== GameState.BATTLE) {
                    resolve();
                    return;
                }
                const playerCard = this.player.playCard();
                const aiCard = this.aiPlayer.playCard();
                if (!playerCard || !aiCard) {
                    yield this.endGame();
                    resolve();
                    return;
                }
                const playerCardSprite = yield this.scene.revealCard(playerCard, this.scene.playerDeckSize.x, this.scene.playerDeckSize.y);
                const aiCardSprite = yield this.scene.revealCard(aiCard, this.scene.aiDeckSize.x, this.scene.aiDeckSize.y);
                yield this.scene.delay(500);
                const playerRank = Math.floor(playerCard.getSymbol() / 4);
                const aiRank = Math.floor(aiCard.getSymbol() / 4);
                if (playerRank > aiRank) {
                    this.scene.updateUI("You won the battle!");
                    this.scene.battleWinSound.play();
                    this.player.addCards([playerCard, aiCard]);
                    yield this.scene.moveCardsToWinner(this.scene.playerDeck, [playerCardSprite, aiCardSprite]);
                }
                else if (playerRank < aiRank) {
                    this.scene.updateUI("AI won the battle!");
                    this.scene.battleLoseSound.play();
                    this.aiPlayer.addCards([playerCard, aiCard]);
                    yield this.scene.moveCardsToWinner(this.scene.aiDeck, [playerCardSprite, aiCardSprite]);
                }
                else {
                    yield this.startWar([playerCard, aiCard], [playerCardSprite, aiCardSprite]);
                }
                console.log("You:", this.player.getDeckSize(), " - AI:", this.aiPlayer.getDeckSize());
                yield this.checkGameOver();
                // if (this.state === GameState.BATTLE) {
                //     if (!this.scene.autoPlay) {
                //         this.scene.enablePlayerInteraction(() => this.playTurn());
                //     }
                //     else {
                //         await this.scene.autoPlayTurn();
                //     }
                // }
                resolve();
            }));
        });
    }
    startWar(warCards, sprites) {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.updateUI("War!");
            this.state = GameState.WAR;
            this.scene.toggleBackground(true);
            // Each player adds 3 hidden cards
            for (let i = 0; i < 3; i++) {
                const playerCard = this.player.playCard();
                const aiCard = this.aiPlayer.playCard();
                if (playerCard && aiCard) {
                    warCards.push(playerCard, aiCard);
                }
                else {
                    // If either player runs out of cards during war, end the game
                    yield this.endGame();
                    return;
                }
            }
            yield this.scene.showWarAnimation(warCards, sprites);
        });
    }
    WarBattle(warCards, sprites) {
        return __awaiter(this, void 0, void 0, function* () {
            // const sprites = await this.scene.putAIBackCard(spritesSoFar);
            //sprites.push(...faceDownCards);
            //this.state = GameState.BATTLE;
            //this.scene.updateUI("Battle!");
            if (this.scene.autoPlay) {
                console.log("first ", this.scene.autoPlay);
                yield this.revealFinalWarCards(warCards, sprites);
                console.log("after ", this.scene.autoPlay);
            }
            else {
                this.scene.playerDeck.disableInteractive();
                console.log("startwar- regular");
                this.scene.enablePlayerInteraction(() => {
                    this.scene.clickSound.play();
                    this.revealFinalWarCards(warCards, sprites);
                });
            }
        });
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
        this.scene.updateUI(randomPhrase);
        winner === "player" ? this.scene.warWinSound.play() : this.scene.warLoseSound.play();
        ;
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
                yield this.scene.delay(500);
                // Determine the winner
                const playerRank = Math.floor(playerFinalCard.getSymbol() / 4);
                const aiRank = Math.floor(aiFinalCard.getSymbol() / 4);
                if (playerRank > aiRank) {
                    this.player.addCards(warCards);
                    yield this.scene.moveCardsToWinner(this.scene.playerDeck, sprites);
                    this.showWarResult("player");
                }
                else if (playerRank < aiRank) {
                    this.aiPlayer.addCards(warCards);
                    yield this.scene.moveCardsToWinner(this.scene.aiDeck, sprites);
                    this.showWarResult("ai");
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
            // this.scene.toggleBackground(false);
            //this.state = GameState.BATTLE;
            //await this.checkGameOver();
        });
    }
    checkGameOver() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.player.getDeckSize() === 0 || this.aiPlayer.getDeckSize() === 0) {
                yield this.endGame();
            }
            else {
                this.scene.toggleBackground(false);
                this.state = GameState.BATTLE;
            }
        });
    }
    endGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.scene.autoPlay = false;
            this.scene.autoPlayButton.disableInteractive();
            this.scene.playerDeck.disableInteractive();
            this.state = GameState.GAME_OVER;
            this.scene.showEndGameScreen(this.player.getDeckSize() > 0);
        });
    }
    getState() {
        return this.state;
    }
}
