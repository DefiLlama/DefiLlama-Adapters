const ethers = require("ethers");


// initialize the provider -- can be hot-swapped with any other RPC Provider with instant flow-down through all functions
const PROVIDER = new ethers.providers.JsonRpcProvider(
  "https://polygon-mainnet.g.alchemy.com/v2/k1uKkB1bRKWRYci4RBUyA4z_k_8SiwWL"
);

module.exports = { PROVIDER };
