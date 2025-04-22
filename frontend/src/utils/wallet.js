import { ethers } from 'ethers';

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
    return window.ethereum && window.ethereum.isMetaMask;
};

// Connect to MetaMask wallet
export const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        // Get the connected wallet address
        const address = accounts[0];

        // Get ethereum provider and create ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // Return the address and provider
        return {
            address,
            provider,
            shortAddress: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
        };
    } catch (error) {
        throw new Error(error.message || "Failed to connect to wallet");
    }
};

// Listen for account changes
export const setupAccountChangedListener = (callback) => {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // User disconnected their wallet
                callback(null);
            } else {
                // User switched accounts
                const address = accounts[0];
                callback({
                    address,
                    shortAddress: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                });
            }
        });
    }
}; 