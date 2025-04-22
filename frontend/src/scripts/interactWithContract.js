/**
 * This script demonstrates interacting with the MemoryCardGame smart contract.
 * It can be run using Node.js to test contract interactions directly.
 */

import { ethers } from 'ethers';
import MemoryCardGameABI from '../artifacts/contracts/MemoryCardGame.sol/MemoryCardGame.json';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// For running in Node.js environment
async function main() {
    try {
        // Connect to the Hardhat node
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');// CHANGE THIS TO BASE SEPOLIA URL

        // Use one of the default hardhat accounts
        const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // hardhat account #0
        const wallet = new ethers.Wallet(privateKey, provider);
        // CONNECTED TO WALLET
        console.log('Connected to wallet address:', wallet.address);

        // Create a contract instance
        const contract = new ethers.Contract(
            contractAddress,
            MemoryCardGameABI.abi,
            wallet
        );

        console.log('Connected to contract at address:', contractAddress);

        // Start a new game
        console.log('\n===== Starting a new game =====');
        const startGameTx = await contract.startGame(0); // 0 = Easy difficulty
        console.log('Transaction hash:', startGameTx.hash);

        // Wait for transaction to be mined
        const startGameReceipt = await startGameTx.wait();
        console.log('Transaction was mined in block:', startGameReceipt.blockNumber);

        // Extract the gameId from the event
        const gameStartedEvent = startGameReceipt.logs
            .filter(log => log.fragment && log.fragment.name === 'GameStarted')
            .map(log => ({ ...log.args }))[0];

        const gameId = gameStartedEvent ? gameStartedEvent[0] : null;
        console.log('Game started with ID:', gameId.toString());

        // Record some moves
        console.log('\n===== Recording a failed match =====');
        const recordFailedMoveTx = await contract.recordMove(gameId, false);
        console.log('Transaction hash:', recordFailedMoveTx.hash);
        const recordFailedMoveReceipt = await recordFailedMoveTx.wait();
        console.log('Failed match recorded in block:', recordFailedMoveReceipt.blockNumber);

        console.log('\n===== Recording a successful match =====');
        const recordSuccessMoveTx = await contract.recordMove(gameId, true);
        console.log('Transaction hash:', recordSuccessMoveTx.hash);
        const recordSuccessMoveReceipt = await recordSuccessMoveTx.wait();
        console.log('Successful match recorded in block:', recordSuccessMoveReceipt.blockNumber);

        // Validate a match
        console.log('\n===== Validating a match =====');
        const isValidMatch = await contract.validateMatch(1, 2, 'card_image.png', 'card_image.png');
        console.log('Is valid match:', isValidMatch);

        // Complete the game
        console.log('\n===== Completing the game =====');
        const completeGameTx = await contract.completeGame(gameId, 60); // 60 seconds
        console.log('Transaction hash:', completeGameTx.hash);
        const completeGameReceipt = await completeGameTx.wait();
        console.log('Game completed in block:', completeGameReceipt.blockNumber);

        // Get game details
        console.log('\n===== Getting game details =====');
        const gameDetails = await contract.getGameDetails(gameId);
        console.log('Game details:', {
            id: gameDetails.id.toString(),
            player: gameDetails.player,
            score: gameDetails.score.toString(),
            attempts: gameDetails.attempts.toString(),
            timeSpent: gameDetails.timeSpent.toString(),
            completed: gameDetails.completed,
            difficulty: gameDetails.difficulty.toString()
        });

        // Get player games
        console.log('\n===== Getting player games =====');
        const playerGames = await contract.getPlayerGames(wallet.address);
        console.log('Player games:', playerGames.map(id => id.toString()));

        console.log('\n===== Interaction completed successfully =====');
    } catch (error) {
        console.error('Error interacting with contract:', error);
    }
}

// This script can be executed directly with Node.js
if (typeof window === 'undefined') {
    main();
}

// Browser version for frontend
export async function runInteractionDemo() {
    // This could be used to demonstrate contract interaction in the browser
    console.log('Starting contract interaction demo from browser...');

    try {
        // Check if MetaMask is available
        if (!window.ethereum) {
            console.error('Please install MetaMask to interact with the blockchain');
            return;
        }

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        console.log('Connected to wallet address:', await signer.getAddress());

        // Create a contract instance
        const contract = new ethers.Contract(
            contractAddress,
            MemoryCardGameABI.abi,
            signer
        );

        console.log('Connected to contract at address:', contractAddress);

        // Start a new game
        console.log('\n===== Starting a new game =====');
        const startGameTx = await contract.startGame(0); // 0 = Easy difficulty
        console.log('Transaction hash:', startGameTx.hash);

        // Wait for transaction to be mined
        const startGameReceipt = await startGameTx.wait();
        console.log('Transaction was mined in block:', startGameReceipt.blockNumber);

        // Extract the gameId from the event
        const gameStartedEvent = startGameReceipt.logs
            .filter(log => log.fragment && log.fragment.name === 'GameStarted')
            .map(log => ({ ...log.args }))[0];

        const gameId = gameStartedEvent ? gameStartedEvent[0] : null;
        console.log('Game started with ID:', gameId.toString());

        // Get game details
        console.log('\n===== Getting game details =====');
        const gameDetails = await contract.getGameDetails(gameId);
        console.log('Game details:', {
            id: gameDetails.id.toString(),
            player: gameDetails.player,
            score: gameDetails.score.toString(),
            attempts: gameDetails.attempts.toString(),
            timeSpent: gameDetails.timeSpent.toString(),
            completed: gameDetails.completed,
            difficulty: gameDetails.difficulty.toString()
        });

        console.log('\n===== Demo interaction completed successfully =====');
        return gameId;
    } catch (error) {
        console.error('Error in demo interaction:', error);
        throw error;
    }
}