const { getUniTVL } = require("../helper/unknownTokens");
const abi = require("../kyber/abi.json");

const chains = {
  ethereum: {
    graphId: "mainnet",
    factory: "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE"
  },
  arbitrum: {
    graphId: "arbitrum-one",
    factory: "0x51E8D106C646cA58Caf32A47812e95887C071a62"
  },
  polygon: {
    graphId: "matic",
    factory: "0x5F1fe642060B5B9658C15721Ea22E982643c095c"
  },
  avax: {
    graphId: "avalanche",
    factory: "0x10908C875D865C66f271F5d3949848971c9595C9"
  },
  bsc: {
    graphId: "bsc",
    factory: "0x878dFE971d44e9122048308301F540910Bbd934c"
  },
  fantom: {
    graphId: "fantom",
    factory: "0x78df70615ffc8066cc0887917f2Cd72092C86409"
  },
  cronos: {
    graphId: "cronos",
    factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974"
  },
  optimism: {
    graphId: "optimism",
    factory: "0x1c758aF0688502e49140230F6b0EBd376d429be5"
  },
  aurora: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" },
  velas: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" },
  oasis: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" },
  bittorrent: { factory: "0xD9bfE9979e9CA4b2fe84bA5d4Cf963bBcB376974" },
};

function classic(chain) {
  const factory = chains[chain].factory
  if (!factory) return {}
  return getUniTVL({
    chain, factory: chains[chain].factory, abis: {
      allPairsLength: abi.allPoolsLength,
      allPairs: abi.allPools,
      getReserves: abi.getReserves,
    },
  })
}

module.exports = {
  timetravel: false,
};
Object.keys(chains).forEach(chain => {
  module.exports[chain] = {
    tvl: classic(chain)
  };
});
