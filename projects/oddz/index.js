const ADDRESSES = require('../helper/coreAssets.json')
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
const bscPools = [
  // pool, token, representation
  [
    "0x99f29c537c70897f60c9774d3f13bd081D423467",
    ADDRESSES.bsc.USDC,
    "bsc:" + ADDRESSES.bsc.USDC,
  ], // oUSD
];

const bscStakingPool = [
  [
    "0x636f9d2Bb973D2E54d2577b9976DedFDc21E6672",
    "0xcd40f2670cf58720b694968698a5514e924f742d",
    "bsc:0xcd40f2670cf58720b694968698a5514e924f742d",
  ], // sODDZ
];

const bscPool2 = [
  [
    "0x3c2c77353E2F6AC1578807b6b2336Bf3a3CbB014",
    "0xcd40f2670cf58720b694968698a5514e924f742d",
    "bsc:0xcd40f2670cf58720b694968698a5514e924f742d",
  ], // sODDZ
  [
    "0x3c2c77353E2F6AC1578807b6b2336Bf3a3CbB014",
    ADDRESSES.bsc.WBNB,
    "bsc:" + ADDRESSES.bsc.WBNB,
  ], // ODDZ-BNB
];


const avaxPools = [
  // pool, token, representation
  [
    "0x6a165bA195D9d331b2A1C9648328d409aA599465",
    ADDRESSES.avax.USDC_e,
    "avax:" + ADDRESSES.avax.USDC_e,
  ], // oUSD
];

const avaxStakingPool = [
  [
    "0xd0A145aF8F200Fc8e4d118c6e4d4a77eE1ba8E2e",
    "0xB0a6e056B587D0a85640b39b1cB44086F7a26A1E",
    "avax:0xB0a6e056B587D0a85640b39b1cB44086F7a26A1E",
  ], // sODDZ
];

const avaxPool2 = [
  [
    "0xBAe8Ee2D95Aa5c68Fe8373Cd0208227E94075D5d",
    "0xb0a6e056b587d0a85640b39b1cb44086f7a26a1e",
    "avax:0xb0a6e056b587d0a85640b39b1cb44086f7a26a1e",
  ], // sODDZ
  [
    "0x3c2c77353E2F6AC1578807b6b2336Bf3a3CbB014",
    ADDRESSES.avax.WAVAX,
    "avax:" + ADDRESSES.avax.WAVAX,
  ], // ODDZ-AVAX
];


async function bsc(_timestamp, block, chainBlocks) {
  return getTotalCollateral(bscPools, "bsc", chainBlocks["bsc"]);
}
async function pool2(timestamp, block, chainBlocks) {
  return getTotalCollateral(bscPool2, "bsc", chainBlocks["bsc"]);
}
async function bscStaking(timestamp, block, chainBlocks) {
  return getTotalCollateral(bscStakingPool, "bsc", chainBlocks["bsc"]);
}

async function avax(_timestamp, block, chainBlocks) {
  return getTotalCollateral(avaxPools, "avax", chainBlocks["avax"]);
}
async function pool3(timestamp, block, chainBlocks) {
  return getTotalCollateral(avaxPool2, "avax", chainBlocks["avax"]);
}
async function avaxStaking(timestamp, block, chainBlocks) {
  return getTotalCollateral(avaxStakingPool, "avax", chainBlocks["avax"]);
}


module.exports = {
  bsc: {
    tvl: bsc,
    pool2,
    staking: bscStaking,
  },
  avax: {
    tvl: avax,
    pool2: pool2,
    staking: avaxStaking,
  },
};