const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js");
const {tvlV1Eth, tvlV1Bsc} = require('./v1.js')
const {tvlV2, tvlV2Onchain} = require('./v2.js')

async function ethTvl(timestamp, block) {
  const ethAddress = ADDRESSES.null;
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

async function fantomTvl(timestamp, block, chainBlocks) {
  return tvlV2Onchain(chainBlocks.fantom, "fantom")
}
async function opTvl(timestamp, block, chainBlocks) {
  return tvlV2Onchain(chainBlocks.optimism, "optimism")
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  ethereum:{
    tvl: ethTvl
  },
  bsc:{
    tvl: tvlV1Bsc
  },
  avax:{
    tvl: avaxTvl
  },
  fantom:{
    tvl: fantomTvl
  },
  optimism:{
    tvl: opTvl
  },
  start: 1602054167, // unix timestamp (utc 0) specifying when the project began, or where live data begins
  hallmarks: [
    [1613178000, "37M exploit"], // Feb 13, 2021
    [1626220800, "Upgrade to V2 on ETH"], // July 14, 2021 00:00 UTC
  ]
};
