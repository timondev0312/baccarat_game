"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaccaratGame = void 0;
const types_1 = require("../types");
class BaccaratGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.bankerHand = [];
    }
    initGame(callback) {
        this.playerHand = [];
        this.bankerHand = [];
        this.initializeDeck();
        if (this.dealCards()) {
            callback(this.playerHand, this.bankerHand);
        }
    }
    // Create a standard 8-deck shoe
    initializeDeck() {
        const suits = [types_1.Suit.Hearts, types_1.Suit.Diamonds, types_1.Suit.Clubs, types_1.Suit.Spades];
        const ranks = [types_1.Rank.Ace, types_1.Rank.Two, types_1.Rank.Three, types_1.Rank.Four, types_1.Rank.Five, types_1.Rank.Six, types_1.Rank.Seven, types_1.Rank.Eight, types_1.Rank.Nine, types_1.Rank.Ten, types_1.Rank.Jack, types_1.Rank.Queen, types_1.Rank.King];
        this.deck = [];
        // Create 8 decks
        for (let i = 0; i < 8; i++) {
            for (const suit of suits) {
                for (const rank of ranks) {
                    this.deck.push({ rank, suit });
                }
            }
        }
        // Shuffle the deck
        this.shuffleDeck();
    }
    // Fisher-Yates Shuffle algorithm
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    // Deal cards to player and banker
    dealCards() {
        this.playerHand = [this.drawCard(), this.drawCard()];
        this.bankerHand = [this.drawCard(), this.drawCard()];
        // Handle third card rules if needed
        return this.handleThirdCardRules();
    }
    // Draw a card from the deck
    drawCard() {
        return this.deck.pop();
    }
    // Handle third card rules
    handleThirdCardRules() {
        const playerScore = this.calculateScore(this.playerHand);
        const bankerScore = this.calculateScore(this.bankerHand);
        // Player draws a third card if their score is 5 or less
        if (playerScore <= 5) {
            this.playerHand.push(this.drawCard());
        }
        // Banker draws based on complex rules
        if (bankerScore <= 2) {
            this.bankerHand.push(this.drawCard());
        }
        else if (this.playerHand[2]) {
            if (bankerScore === 3 && this.playerHand[2].rank !== types_1.Rank.Eight) {
                this.bankerHand.push(this.drawCard());
            }
            else if (bankerScore === 4 && this.playerHand[2].rank >= types_1.Rank.Two && this.playerHand[2].rank <= types_1.Rank.Seven) {
                this.bankerHand.push(this.drawCard());
            }
            else if (bankerScore === 5 && this.playerHand[2].rank >= types_1.Rank.Four && this.playerHand[2].rank <= types_1.Rank.Seven) {
                this.bankerHand.push(this.drawCard());
            }
            else if (bankerScore === 6 && this.playerHand[2].rank >= types_1.Rank.Six && this.playerHand[2].rank <= types_1.Rank.Seven) {
                this.bankerHand.push(this.drawCard());
            }
        }
        return true;
    }
    // Calculate score based on Baccarat rules
    calculateScore(hand) {
        const total = hand.reduce((acc, card) => {
            return acc + (card.rank > 10 ? 0 : card.rank);
        }, 0);
        // Return only the last digit of the total (Baccarat rules)
        return total % 10;
    }
    // Determine the winner (Player, Banker, or Tie)
    determineWinner(playerHand, bankerHand) {
        const playerScore = this.calculateScore(playerHand);
        const bankerScore = this.calculateScore(bankerHand);
        if (playerScore > bankerScore)
            return 'Player';
        if (bankerScore > playerScore)
            return 'Banker';
        return 'Tie';
    }
    // Check for pairs (Player Pair or Banker Pair)
    checkPairs(playerHand, bankerHand) {
        const playerPair = playerHand[0].rank === playerHand[1].rank;
        const bankerPair = bankerHand[0].rank === bankerHand[1].rank;
        return { playerPair, bankerPair };
    }
    // Utility function to display a card's rank and suit properly
    formatCard(card) {
        const rankNames = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suitNames = ['♦', '♣', '♥', '♠'];
        return `${rankNames[card.rank - 1]}${suitNames[card.suit]}`;
    }
    // Updated printGameState() method
    printGameState(playerHand, bankerHand) {
        const playerCards = playerHand.map(this.formatCard).join(', ');
        const bankerCards = bankerHand.map(this.formatCard).join(', ');
        console.log(`Player Hand: ${playerCards} | Score: ${this.calculateScore(playerHand)}`);
        console.log(`Banker Hand: ${bankerCards} | Score: ${this.calculateScore(bankerHand)}`);
    }
}
exports.BaccaratGame = BaccaratGame;
