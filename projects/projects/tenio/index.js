const { ethers } = require("ethers");

const ABI = [
  "function tokenIds() view returns (uint256)"
];

const CONTRACT_ADDRESS = "0x8cfc6b16b01604c83bef1e315d6693d2e7dA43Ad"; // Mainnet
const COLLATERAL_PER_TOKEN = 0.1; // ETH

module.exports = {
  timetravel: false,
  start: 1718000000, // Aproximado a fecha del despliegue
  ethereum: {
    tvl: async () => {
      const provider = new ethers.providers.JsonRpcProvider("https://eth.llamarpc.com");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const minted = await contract.tokenIds();
      return {
        ethereum: minted.toNumber() * COLLATERAL_PER_TOKEN
      };
    }
  }
};
