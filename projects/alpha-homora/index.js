const {tvlV1Eth, tvlV1Bsc} = require('./v1.js')
const {tvlV2, tvlV2Onchain} = require('./v2.js')

async function ethTvl(api) {
  await Promise.all([
    tvlV1Eth(api),
    tvlV2(api),
  ])
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
    tvl: tvlV2Onchain
  },
  fantom:{
    tvl: tvlV2Onchain
  },
  optimism:{
    tvl: tvlV2Onchain
  },
  start: '2020-10-07', // unix timestamp (utc 0) specifying when the project began, or where live data begins
  hallmarks: [
    [1613178000, "37M exploit"], // Feb 13, 2021
    [1626220800, "Upgrade to V2 on ETH"], // July 14, 2021 00:00 UTC
  ]
};
