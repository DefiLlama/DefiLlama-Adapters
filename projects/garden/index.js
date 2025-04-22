const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/sumTokens");
const sdk = require("@defillama/sdk");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");
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
      tokens: [
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.USDC,
        "0x20157dbabb84e3bbfe68c349d0d44e48ae7b5ad2",
        ADDRESSES.ethereum.cbBTC,
        nullAddress,
      ],
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: WBTC_LIQUIDITY_ADDRESSES,
      tokens: [
        ADDRESSES.arbitrum.WBTC,
        "0x050c24dbf1eec17babe5fc585f06116a259cc77a",
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
      ],
    }),
    staking: sumTokensExport({
      owners: [STAKING_CONTRACT_ADDRESS],
      tokens: [SEED_TOKEN_ADDRESS],
    }),
  },
  berachain: {
    tvl: sumTokensExport({
      owners: WBTC_LIQUIDITY_ADDRESSES,
      tokens: ["0xecac9c5f704e954931349da37f60e39f515c11c1"],
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: WBTC_LIQUIDITY_ADDRESSES,
      tokens: [ADDRESSES.base.USDC, ADDRESSES.base.cbBTC, nullAddress],
    }),
  },
};
