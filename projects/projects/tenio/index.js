const { ethers } = require("ethers");

const ABI = [
  "function tokenIds() view returns (uint256)"
];

const CONTRACT_ADDRESS = "0xc8583a9d069ccce7c76ecde839b5ac2508d51a65"; // Sepolia
const COLLATERAL_PER_TOKEN = 0.1; // ETH

module.exports = {
  timetravel: false,
  start: 1718000000,
  ethereum: {
    tvl: async () => {
      const provider = new ethers.providers.JsonRpcProvider("https://rpc.sepolia.org");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const minted = await contract.tokenIds();
      return {
        ethereum: minted.toNumber() * COLLATERAL_PER_TOKEN
      };
    }
  },
  methodology: "Cada fragmento minteado representa 0.10 ETH de colateral on-chain. TVL = fragmentos activos * 0.10 ETH"
};
