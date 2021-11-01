const BigNumber = require("bignumber.js");
const {tvlV1Eth, tvlV1Bsc} = require('./v1')
const {tvlV2, tvlV2Onchain} = require('./v2')

async function ethTvl(timestamp, block) {
  const ethAddress = "0x0000000000000000000000000000000000000000";
  const balances = {};

  const tvls = await Promise.all([
    tvlV1Eth(timestamp, block),
    tvlV2(block, "ethereum", true),
  ]);

  const ethTvl = BigNumber.sum(tvls[0], tvls[1]);
  balances[ethAddress] = ethTvl.toFixed(0);

  return balances;
}

async function avaxTvl(timestamp, block, chainBlocks) {
  return tvlV2Onchain(chainBlocks.avax, "avax")
}

module.exports = {
  misrepresentedTokens: true,
  ethereum:{
    tvl: ethTvl
  },
  bsc:{
    tvl: tvlV1Bsc
  },
  avalanche:{
    tvl: avaxTvl
  },
  start: 1602054167, // unix timestamp (utc 0) specifying when the project began, or where live data begins
};
