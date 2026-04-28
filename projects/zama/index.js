const { sumTokensExport } = require("../helper/unwrapLPs");

const cUSDC = "0xe978F22157048E5DB8E5d07971376e86671672B2";
const ctGBP = "0xa873750ccBafD5ec7Dd13bfD5237d7129832eDD9";
const cUSDT = "0xAe0207C757Aa2B4019Ad96edD0092ddc63EF0c50";

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const TGBP = "0x27f6c8289550fce67f6b50bed1f519966afe5287";

const tokensAndOwners = [
  [USDC, cUSDC],
  [TGBP, ctGBP],
  [USDT, cUSDT],
];

module.exports = {
  doublecounted: true,
  methodology:
    "Counts the public ERC-20 reserves locked in Zama's confidential wrapper contracts on Ethereum. TVL is the balance of USDC in cUSDC, tGBP in the confidential tGBP wrapper, and USDT in cUSDT.",
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners }),
  },
};
