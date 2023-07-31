const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const contracts = ["0x1390f521A79BaBE99b69B37154D63D431da27A07"];

const tokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.WBTC,
];

async function tvl(timestamp, block) {
  return sumTokens2({ owner: contracts[0], tokens: tokens, block });
}

module.exports = {
  start: 1685817000,
  ethereum: { tvl },
};
