require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/",//ADD KEY
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: 11155111
    }
  },
  paths: {
    artifacts: "../frontend/src/artifacts"
  }
};
