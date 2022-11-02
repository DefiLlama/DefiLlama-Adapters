const ethers = require('ethers')

const astarProvider = new ethers.providers.JsonRpcProvider(
  "https://astar.public.blastapi.io"
);

const SupportedChain = {
  Mainnet: 1,
  Astar: 592
}

const Providers = {
  [SupportedChain.Mainnet]: astarProvider,
  [SupportedChain.Astar]: new ethers.providers.JsonRpcProvider(),
};

module.exports = { SupportedChain, Providers };