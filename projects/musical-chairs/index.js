const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

// Actual deployed contract address on Arbitrum One
const CONTRACT_ADDRESS = "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF"; 

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owner: CONTRACT_ADDRESS, tokens: [ADDRESSES.null] }),
  },
  methodology: "TVL is calculated as the total ETH balance held in the MusicalChairsGame smart contract. This includes player stakes for active and pending games, as well as any accumulated but not yet withdrawn platform commissions.",
};
