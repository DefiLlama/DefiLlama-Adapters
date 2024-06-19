const ADDRESSES = require("../helper/coreAssets.json");
const { cexExports } = require("../helper/cex");

const SEED_TOKEN_ADDRESS = "0x86f65121804D2Cdbef79F9f072D4e0c2eEbABC08"; // SEED TOKEN (Garden's Governance Token) Address
const STAKING_CONTRACT_ADDRESS = "0xe2239938Ce088148b3Ab398b2b77Eedfcd9d1AfC";

const BTC_LIQUIDITY_ADDRESS = "bc1qhww67feqfdf6xasjat88x5stqa6vzx0c6fgtnj";
const WBTC_LIQUIDITY_ADDRESS = "0x9DD9C2D208B07Bf9A4eF9CA311F36d7185749635";

module.exports = cexExports({
  bitcoin: { owners: [BTC_LIQUIDITY_ADDRESS] },
  arbitrum: {
    tokensAndOwners: [
      [ADDRESSES.arbitrum.WBTC, WBTC_LIQUIDITY_ADDRESS],
      [SEED_TOKEN_ADDRESS, STAKING_CONTRACT_ADDRESS],
    ],
  },
});
