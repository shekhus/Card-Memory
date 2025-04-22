const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MemoryCardGame", function () {
    let memoryCardGame;
    let owner;
    let player1;
    let player2;

    beforeEach(async function () {
        [owner, player1, player2] = await ethers.getSigners();

        const MemoryCardGame = await ethers.getContractFactory("MemoryCardGame");
        memoryCardGame = await MemoryCardGame.deploy();
    });

    describe("Game initialization", function () {
        it("Should create a new game", async function () {
            await memoryCardGame.connect(player1).startGame(0); // Easy difficulty
            const gameId = 1;
            const game = await memoryCardGame.games(gameId);

            expect(game.id).to.equal(gameId);
            expect(game.player).to.equal(player1.address);
            expect(game.score).to.equal(0);
            expect(game.attempts).to.equal(0);
            expect(game.completed).to.equal(false);
            expect(game.difficulty).to.equal(0); // Easy
        });

        it("Should emit GameStarted event", async function () {
            await expect(memoryCardGame.connect(player1).startGame(0))
                .to.emit(memoryCardGame, "GameStarted")
                .withArgs(1, player1.address, 0);
        });
    });

    describe("Game moves", function () {
        let gameId;

        beforeEach(async function () {
            const tx = await memoryCardGame.connect(player1).startGame(0);
            gameId = 1;
        });

        it("Should record a move and update attempts", async function () {
            await memoryCardGame.connect(player1).recordMove(gameId, false);
            const game = await memoryCardGame.games(gameId);

            expect(game.attempts).to.equal(1);
            expect(game.score).to.equal(0);
        });

        it("Should record a match and update score", async function () {
            await memoryCardGame.connect(player1).recordMove(gameId, true);
            const game = await memoryCardGame.games(gameId);

            expect(game.attempts).to.equal(1);
            expect(game.score).to.equal(1);
        });

        it("Should emit MoveMade event", async function () {
            await expect(memoryCardGame.connect(player1).recordMove(gameId, true))
                .to.emit(memoryCardGame, "MoveMade")
                .withArgs(gameId, player1.address, 1, 1);
        });

        it("Should not allow other players to record moves in someone else's game", async function () {
            await expect(
                memoryCardGame.connect(player2).recordMove(gameId, true)
            ).to.be.revertedWith("Not your game");
        });
    });

    describe("Game completion", function () {
        let gameId;

        beforeEach(async function () {
            const tx = await memoryCardGame.connect(player1).startGame(0);
            gameId = 1;

            // Record some moves
            await memoryCardGame.connect(player1).recordMove(gameId, true);
            await memoryCardGame.connect(player1).recordMove(gameId, false);
        });

        it("Should complete a game correctly", async function () {
            const timeSpent = 120; // 2 minutes
            await memoryCardGame.connect(player1).completeGame(gameId, timeSpent);

            const game = await memoryCardGame.games(gameId);
            expect(game.completed).to.equal(true);
            expect(game.timeSpent).to.equal(timeSpent);
        });

        it("Should emit GameCompleted event", async function () {
            const timeSpent = 120;
            await expect(memoryCardGame.connect(player1).completeGame(gameId, timeSpent))
                .to.emit(memoryCardGame, "GameCompleted")
                .withArgs(gameId, player1.address, 1, timeSpent);
        });

        it("Should not allow completing the same game twice", async function () {
            await memoryCardGame.connect(player1).completeGame(gameId, 120);

            await expect(
                memoryCardGame.connect(player1).completeGame(gameId, 150)
            ).to.be.revertedWith("Game already completed");
        });
    });

    describe("Match validation", function () {
        it("Should validate correct matches", async function () {
            const result = await memoryCardGame.validateMatch(1, 2, "card_image.png", "card_image.png");
            expect(result).to.equal(true);
        });

        it("Should reject incorrect matches", async function () {
            const result = await memoryCardGame.validateMatch(1, 2, "card1.png", "card2.png");
            expect(result).to.equal(false);
        });

        it("Should reject same card ID as a match", async function () {
            const result = await memoryCardGame.validateMatch(1, 1, "card_image.png", "card_image.png");
            expect(result).to.equal(false);
        });
    });

    describe("Player data queries", function () {
        beforeEach(async function () {
            // Create 2 games for player1
            await memoryCardGame.connect(player1).startGame(0);
            await memoryCardGame.connect(player1).startGame(1);

            // Create 1 game for player2
            await memoryCardGame.connect(player2).startGame(2);
        });

        it("Should retrieve player's games correctly", async function () {
            const player1Games = await memoryCardGame.getPlayerGames(player1.address);
            expect(player1Games.length).to.equal(2);
            expect(player1Games[0]).to.equal(1);
            expect(player1Games[1]).to.equal(2);

            const player2Games = await memoryCardGame.getPlayerGames(player2.address);
            expect(player2Games.length).to.equal(1);
            expect(player2Games[0]).to.equal(3);
        });

        it("Should retrieve game details correctly", async function () {
            const gameDetails = await memoryCardGame.getGameDetails(1);
            expect(gameDetails.id).to.equal(1);
            expect(gameDetails.player).to.equal(player1.address);
            expect(gameDetails.difficulty).to.equal(0);
        });

        it("Should revert when querying non-existent game", async function () {
            await expect(
                memoryCardGame.getGameDetails(999)
            ).to.be.revertedWith("Game does not exist");
        });
    });
}); 