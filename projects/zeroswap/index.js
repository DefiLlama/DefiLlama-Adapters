const sdk = require("@defillama/sdk");

async function getTotalCollateral(pools, chain, block) {
  const balances = {};
  await Promise.all(
    pools.map((pool) =>
      sdk.api.erc20
        .balanceOf({
          target: pool[1],
          owner: pool[0],
          chain,
          block,
        })
        .then((result) =>
          sdk.util.sumSingleBalance(balances, pool[2], result.output)
        )
    )
  );
  return balances;
}

const ETH_POOL = [
  [
    "0x2E03677a64CFd8EF9510E11855581Cb22f2acaDe",
    "0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5",
    "ethereum:0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5",
  ], // ZEE-WETH
  [
    "0x2E03677a64CFd8EF9510E11855581Cb22f2acaDe",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  ], // ZEE-WETH
];

const ETH_STAKING = [
 [
  '0xEDF822c90d62aC0557F8c4925725A2d6d6f17769',
  '0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5',
  'ethereum:0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5'
  ]
];

const BSC_STAKING = [
 [
  '0x593497878c33dd1f32098E3F4aE217773F803cf3',
  '0x44754455564474A89358B2C2265883DF993b12F0',
  'bsc:0x44754455564474A89358B2C2265883DF993b12F0'
  ]
];

const BSC_POOL = [
  [
    "0x8e799cb0737525ceb8a6c6ad07f748535ff6377b",
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    "bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  ], // ZEE-WBNB
  [
    "0x8e799cb0737525ceb8a6c6ad07f748535ff6377b",
    "0x44754455564474A89358B2C2265883DF993b12F0",
    "bsc:0x44754455564474A89358B2C2265883DF993b12F0",
  ], // ZEE-WBNB
];


const POLYGON_STAKING = [
 [
  '0x89eA093C07f4FCc03AEBe8A1D5507c15dE88531f',
  '0xfd4959c06fbcc02250952daebf8e0fb38cf9fd8c',
  'polygon:0xfd4959c06fbcc02250952daebf8e0fb38cf9fd8c'
  ]
];


const POLYGON_POOL = [
  [
    "0x356382F459930b424670456F4D3C8d0Aa3B8f3AB",
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    "polygon:0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  ], // ZEE-WMATIC
  [
    "0x356382F459930b424670456F4D3C8d0Aa3B8f3AB",
    "0xfd4959c06FbCc02250952DAEbf8e0Fb38cF9FD8C",
    "polygon:0xfd4959c06FbCc02250952DAEbf8e0Fb38cF9FD8C",
  ], // ZEE-WMATIC
];


async function eth_pool(timestamp, block, chainBlocks) {
  return getTotalCollateral(ETH_POOL, "ethereum", chainBlocks["ethereum"]);
}

async function eth_staking(timestamp, block, chainBlocks) {
  return getTotalCollateral(ETH_STAKING, "ethereum", chainBlocks["ethereum"]);
}

async function bsc_staking(timestamp, block, chainBlocks) {
  return getTotalCollateral(BSC_STAKING, "bsc", chainBlocks["bsc"]);
}

async function bsc_pool(timestamp, block, chainBlocks) {
  return getTotalCollateral(BSC_POOL, "bsc", chainBlocks["bsc"]);
}

async function polygon_staking(timestamp, block, chainBlocks) {
  return getTotalCollateral(POLYGON_STAKING, "polygon", chainBlocks["polygon"]);
}

async function polygon_pool(timestamp, block, chainBlocks) {
  return getTotalCollateral(POLYGON_POOL, "polygon", chainBlocks["polygon"]);
}


module.exports = {
  ethereum: {
    staking: eth_staking,
    tvl: eth_pool
  },
  bsc: {
    staking: bsc_staking,
    tvl: bsc_pool
  },
  polygon: {
    staking: polygon_staking,
    tvl: polygon_pool
  }
};
