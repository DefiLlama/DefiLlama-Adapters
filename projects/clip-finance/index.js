const sdk = require("@defillama/sdk");
const { ethers } = require("ethers");

const ABI = require("./abi.json");
const config = {
  bsc: {
    strategyRouter: "0x03A074D130144FcE6883F7EA3884C0a783d85Fb3",
    fromBlock: 32709480, // deployment block
  },

  linea: {
    strategyRouter: "0x03A074D130144FcE6883F7EA3884C0a783d85Fb3",
    fromBlock: 1064501, // deployment block
  },
};

const fetchChain = async (chain, timestamp, chainBlock) => {
  const { strategyRouter } = config[chain];

  const api = new sdk.ChainApi({
    chain,
    block: chainBlock,
    timestamp,
  });

  const [TVL] = await api.call({
    target: strategyRouter,
    abi: ABI.getStrategiesValue,
  });

  return Number(ethers.formatUnits(TVL));
};

async function fetchTVLs(unixTimestamp, _b, chainBlocks) {
  const tvlPromises = [];
  Object.keys(config).forEach((chain) => {
    tvlPromises.push(fetchChain(chain, unixTimestamp, chainBlocks[chain]));
  });
  const TVLs = await Promise.all(tvlPromises);
  return TVLs.reduce((a, b) => a + b, 0);
}

module.exports = {
  methodology:
    "Fetch TVL as a sum of strategies' values calculated using their underlying tokens and their price from the Chainlink price feeds",
  start: 1697627757, // (Oct-18-2023 11:15:57 AM +UTC)
  fetch: fetchTVLs,
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    fetch: async (unixTimestamp, _b, chainBlocks) => {
      return fetchChain(chain, unixTimestamp, chainBlocks[chain]);
    },
  };
});
