const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/sumTokens");
const sdk = require("@defillama/sdk");
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js');
const { methodology } = require("../allinx.js");

const SEED_TOKEN_ADDRESS = "0x86f65121804D2Cdbef79F9f072D4e0c2eEbABC08"; // SEED TOKEN (Garden's Governance Token) Address
const STAKING_CONTRACT_ADDRESS = "0xe2239938Ce088148b3Ab398b2b77Eedfcd9d1AfC";
const WBTC_LIQUIDITY_ADDRESSES = ["0x3fDEe07b0756651152BF11c8D170D72d7eBbEc49"];

module.exports = {
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners: bitcoinAddressBook.garden }),
    ]),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: WBTC_LIQUIDITY_ADDRESSES,
      tokens: [ADDRESSES.ethereum.WBTC],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: WBTC_LIQUIDITY_ADDRESSES,
      tokens: [ADDRESSES.arbitrum.WBTC],
    }),
    staking: sumTokensExport({
      owners: [STAKING_CONTRACT_ADDRESS],
      tokens: [SEED_TOKEN_ADDRESS],
    }),
  },
};
