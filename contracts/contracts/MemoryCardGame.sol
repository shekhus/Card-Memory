// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemoryCardGame
 * @dev A simple contract for managing memory card game state and validating moves
 */
contract MemoryCardGame is Ownable {
    struct Game {
        uint256 id;
        address player;
        uint256 score;
        uint256 attempts;
        uint256 timeSpent;
        bool completed;
        GameDifficulty difficulty;
    }

    struct Card {
        uint256 id;
        string image;
        bool matched;
    }

    enum GameDifficulty {
        Easy,
        Medium,
        Hard
    }

    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;
    uint256 public gameCount;

    // Events
    event GameStarted(
        uint256 indexed gameId,
        address indexed player,
        GameDifficulty difficulty
    );
    event MoveMade(
        uint256 indexed gameId,
        address indexed player,
        uint256 attempts,
        uint256 score
    );
    event GameCompleted(
        uint256 indexed gameId,
        address indexed player,
        uint256 score,
        uint256 timeSpent
    );

    constructor() Ownable(msg.sender) {
        gameCount = 0;
    }

    /**
     * @dev Start a new game for the caller
     * @param difficulty The difficulty level of the game
     * @return gameId The ID of the newly created game
     */
    function startGame(GameDifficulty difficulty) public returns (uint256) {
        uint256 gameId = ++gameCount;
        games[gameId] = Game({
            id: gameId,
            player: msg.sender,
            score: 0,
            attempts: 0,
            timeSpent: 0,
            completed: false,
            difficulty: difficulty
        });

        playerGames[msg.sender].push(gameId);
        emit GameStarted(gameId, msg.sender, difficulty);
        return gameId;
    }

    /**
     * @dev Record a move in the game, updating the player's score and attempts
     * @param gameId The ID of the game
     * @param matched Whether the move resulted in a match
     * @return success Whether the move was successfully recorded
     */
    function recordMove(uint256 gameId, bool matched) public returns (bool) {
        Game storage game = games[gameId];
        require(game.id > 0, "Game does not exist");
        require(game.player == msg.sender, "Not your game");
        require(!game.completed, "Game already completed");

        game.attempts++;
        if (matched) {
            game.score++;
        }

        emit MoveMade(gameId, msg.sender, game.attempts, game.score);
        return true;
    }

    /**
     * @dev Complete a game, recording the final state
     * @param gameId The ID of the game
     * @param timeSpent The total time spent playing in seconds
     * @return success Whether the game was successfully completed
     */
    function completeGame(
        uint256 gameId,
        uint256 timeSpent
    ) public returns (bool) {
        Game storage game = games[gameId];
        require(game.id > 0, "Game does not exist");
        require(game.player == msg.sender, "Not your game");
        require(!game.completed, "Game already completed");

        game.completed = true;
        game.timeSpent = timeSpent;

        emit GameCompleted(gameId, msg.sender, game.score, timeSpent);
        return true;
    }

    /**
     * @dev Validate that a pair of cards constitutes a valid match
     * @param card1Id ID of the first card
     * @param card2Id ID of the second card
     * @param card1Image Image hash of the first card
     * @param card2Image Image hash of the second card
     * @return isValid Whether the match is valid
     */
    function validateMatch(
        uint256 card1Id,
        uint256 card2Id,
        string memory card1Image,
        string memory card2Image
    ) public pure returns (bool) {
        // Different IDs but same image indicates a match
        if (
            card1Id != card2Id &&
            keccak256(bytes(card1Image)) == keccak256(bytes(card2Image))
        ) {
            return true;
        }
        return false;
    }

    /**
     * @dev Get the games played by a player
     * @param player The address of the player
     * @return gameIds Array of game IDs played by the player
     */
    function getPlayerGames(
        address player
    ) public view returns (uint256[] memory) {
        return playerGames[player];
    }

    /**
     * @dev Get details of a specific game
     * @param gameId The ID of the game
     * @return game The game details
     */
    function getGameDetails(uint256 gameId) public view returns (Game memory) {
        require(games[gameId].id > 0, "Game does not exist");
        return games[gameId];
    }
}
