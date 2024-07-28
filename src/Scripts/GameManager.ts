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
            await this.scene.delay(500);
            const playerRank = Math.floor(playerCard.getSymbol() / 4);
            const aiRank = Math.floor(aiCard.getSymbol()  / 4);
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
            console.log("You:", this.player.getDeckSize(), " - AI:", this.aiPlayer.getDeckSize(),)
            await this.checkGameOver();
            // if (this.state === GameState.BATTLE) {
            //     if (!this.scene.autoPlay) {
            //         this.scene.enablePlayerInteraction(() => this.playTurn());
            //     }
            //     else {
            //         await this.scene.autoPlayTurn();
            //     }
            // }
            resolve();
        });
    }


    async startWar(warCards: Card[], sprites: Phaser.GameObjects.Image[]): Promise<void> {
        this.scene.updateUI("War!");
        this.state = GameState.WAR;
        this.scene.toggleBackground(true);
        // Each player adds 3 hidden cards
        for (let i = 0; i < 3; i++) {
            const playerCard = this.player.playCard();
            const aiCard = this.aiPlayer.playCard();
            if (playerCard && aiCard) {
                warCards.push(playerCard, aiCard);
            } else {
                // If either player runs out of cards during war, end the game
                await this.endGame();
                return;
            }
        }
        await this.scene.showWarAnimation(warCards, sprites);
    }

    async WarBattle(warCards: Card[], sprites: Phaser.GameObjects.Image[]): Promise<void> {
        // const sprites = await this.scene.putAIBackCard(spritesSoFar);
        //sprites.push(...faceDownCards);
        //this.state = GameState.BATTLE;
        //this.scene.updateUI("Battle!");
        if (this.scene.autoPlay) {
            console.log("first ", this.scene.autoPlay);
            await this.revealFinalWarCards(warCards, sprites);
            console.log("after ", this.scene.autoPlay);
        } else {
            this.scene.playerDeck.disableInteractive();
            console.log("startwar- regular")
            this.scene.enablePlayerInteraction(() => {
                    this.scene.clickSound.play();
                    this.revealFinalWarCards(warCards, sprites);
                });
        }
    }

    private showWarResult(winner: "player" | "ai"): void {
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
        winner === "player" ? this.scene.warWinSound.play() : this.scene.warLoseSound.play();;
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
            await this.scene.delay(500);
            // Determine the winner
            const playerRank = Math.floor(playerFinalCard.getSymbol() / 4);
            const aiRank = Math.floor(aiFinalCard.getSymbol()  / 4);
            if (playerRank > aiRank) {
                this.player.addCards(warCards);
                await this.scene.moveCardsToWinner(this.scene.playerDeck, sprites);
                this.showWarResult("player");
            } else if (playerRank < aiRank) {
                this.aiPlayer.addCards(warCards);
                await this.scene.moveCardsToWinner(this.scene.aiDeck, sprites);
                this.showWarResult("ai");
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
        // this.scene.toggleBackground(false);
        //this.state = GameState.BATTLE;
        //await this.checkGameOver();
        
    }

    private async checkGameOver(): Promise<void> {
        if (this.player.getDeckSize() === 0 || this.aiPlayer.getDeckSize() === 0) {
            await this.endGame();
        }
        else {
            this.scene.toggleBackground(false);
            this.state = GameState.BATTLE;
        }
    }

    private async endGame(): Promise<void> {
        this.scene.autoPlay = false;
        this.scene.autoPlayButton.disableInteractive()
        this.scene.playerDeck.disableInteractive();
        this.state = GameState.GAME_OVER;
        this.scene.showEndGameScreen(this.player.getDeckSize() > 0);
    }

    getState(): GameState {
        return this.state;
    }
}