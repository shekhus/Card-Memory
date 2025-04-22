import { ethers } from 'ethers';
import MemoryCardGameABI from '../artifacts/contracts/MemoryCardGame.sol/MemoryCardGame.json';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Initialize provider and contract instance
async function getContract() {
    // Check if window.ethereum is available (MetaMask)
    if (window.ethereum) {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create a new ethers provider using window.ethereum
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Get the signer (current connected account)
            const signer = await provider.getSigner();

            // Create a contract instance
            const contract = new ethers.Contract(
                contractAddress,
                MemoryCardGameABI.abi,
                signer
            );

            console.log('Contract initialized with address:', contractAddress);
            return { contract, signer, provider };
        } catch (error) {
            console.error('Error initializing contract:', error);
            throw error;
        }
    } else {
        console.error('Please install MetaMask or another compatible wallet');
        throw new Error('No ethereum provider detected');
    }
}

// Game Management Functions
export async function startNewGame(difficulty) {
    try {
        const { contract } = await getContract();
        const tx = await contract.startGame(difficulty);
        const receipt = await tx.wait();

        // Extract gameId from the emitted event
        const gameStartedEvent = receipt.logs
            .filter(log => log.fragment && log.fragment.name === 'GameStarted')
            .map(log => ({ ...log.args }))[0];

        const gameId = gameStartedEvent ? gameStartedEvent[0] : null;

        console.log('Game started with ID:', gameId);
        console.log('Transaction hash:', tx.hash);

        return gameId;
    } catch (error) {
        console.error('Error starting game:', error);
        throw error;
    }
}

export async function recordMoveOnChain(gameId, isMatched) {
    try {
        const { contract } = await getContract();
        const tx = await contract.recordMove(gameId, isMatched);
        const receipt = await tx.wait();

        console.log('Move recorded for game ID:', gameId);
        console.log('Transaction hash:', tx.hash);

        return receipt;
    } catch (error) {
        console.error('Error recording move:', error);
        throw error;
    }
}

export async function completeGameOnChain(gameId, timeSpent) {
    try {
        const { contract } = await getContract();
        const tx = await contract.completeGame(gameId, timeSpent);
        const receipt = await tx.wait();

        console.log('Game completed - ID:', gameId);
        console.log('Transaction hash:', tx.hash);

        return receipt;
    } catch (error) {
        console.error('Error completing game:', error);
        throw error;
    }
}

export async function validateMatchOnChain(card1Id, card2Id, card1Image, card2Image) {
    try {
        const { contract } = await getContract();
        const isValid = await contract.validateMatch(card1Id, card2Id, card1Image, card2Image);

        console.log('Match validation result:', isValid);
        return isValid;
    } catch (error) {
        console.error('Error validating match:', error);
        throw error;
    }
}

export async function getPlayerGamesFromChain(playerAddress) {
    try {
        const { contract } = await getContract();
        const games = await contract.getPlayerGames(playerAddress);

        console.log('Player games:', games);
        return games;
    } catch (error) {
        console.error('Error fetching player games:', error);
        throw error;
    }
}

export async function getGameDetailsFromChain(gameId) {
    try {
        const { contract } = await getContract();
        const gameDetails = await contract.getGameDetails(gameId);

        console.log('Game details:', gameDetails);
        return gameDetails;
    } catch (error) {
        console.error('Error fetching game details:', error);
        throw error;
    }
}

export async function getConnectedAddress() {
    try {
        const { signer } = await getContract();
        return await signer.getAddress();
    } catch (error) {
        console.error('Error getting connected address:', error);
        throw error;
    }
} 