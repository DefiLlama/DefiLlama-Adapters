const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens');

const bscMochi = "0x055daB90880613a556a5ae2903B2682f8A5b8d27";
const bscBMochi = "0x2d0e75b683e8b56243b429b24f2b08bcc1ffd8da";
const bscChef = "0x464F1A30e5A5b5b2D3c5f4F0e823e01EeFE304df";
const bscFactory = '0xCBac17919f7aad11E623Af4FeA98B10B84802eAc'

async function bscStaking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (await sdk.api.erc20.balanceOf({
    target: bscBMochi,
    owner: bscChef,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${bscMochi}`, balance);
  return balances;
}

const harmonyFactory = '0x3bEF610a4A6736Fd00EBf9A73DA5535B413d82F6'
const harmonyHMochi = "0x0dd740db89b9fda3baadf7396ddad702b6e8d6f5";
const harmonyStakingToken = "0x691f37653f2fbed9063febb1a7f54bc5c40bed8c";
const harmonyChef = "0xd0cb3e55449646c9735d53e83eea5eb7e97a52dc";


async function harmonyStaking(timestamp, block, chainBlocks) {
  let balances = {};
  let balance = (await sdk.api.erc20.balanceOf({
    target: harmonyStakingToken,
    owner: harmonyChef,
    block: chainBlocks.harmony,
    chain: "harmony"
  })).output;
  sdk.util.sumSingleBalance(balances, `harmony:${harmonyHMochi}`, balance);
  return balances;
}

module.exports = {
 bsc: {
   tvl: getUniTVL({
     chain: 'bsc',
     factory: bscFactory,
     useDefaultCoreAssets: true,
   }),
   staking: bscStaking
 },
  harmony: {
    tvl: getUniTVL({
      chain: 'harmony',
      factory: harmonyFactory,
      useDefaultCoreAssets: true,
    }),
    staking: harmonyStaking,
    hallmarks:[
      [1655991120, "Horizon bridge Hack $100m"],
    ],
  },
  
}
