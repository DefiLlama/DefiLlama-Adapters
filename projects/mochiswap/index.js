const { getUniTVL } = require('../helper/unknownTokens');
const { staking } = require('../helper/staking');

const bscBMochi = "0x2d0e75b683e8b56243b429b24f2b08bcc1ffd8da";
const bscChef = "0x464F1A30e5A5b5b2D3c5f4F0e823e01EeFE304df";
const bscFactory = '0xCBac17919f7aad11E623Af4FeA98B10B84802eAc'

const harmonyFactory = '0x3bEF610a4A6736Fd00EBf9A73DA5535B413d82F6'
const harmonyStakingToken = "0x691f37653f2fbed9063febb1a7f54bc5c40bed8c";
const harmonyChef = "0xd0cb3e55449646c9735d53e83eea5eb7e97a52dc";

module.exports = {
 bsc: {
   tvl: getUniTVL({
     factory: bscFactory,
     useDefaultCoreAssets: true,
   }),
   staking: staking(bscChef, bscBMochi),
 },
  harmony: {
    tvl: getUniTVL({
      factory: harmonyFactory,
      useDefaultCoreAssets: true,
    }),
    staking: staking(harmonyChef, harmonyStakingToken),
    hallmarks:[
      [1655991120, "Horizon bridge Hack $100m"],
    ],
  },
  
}
