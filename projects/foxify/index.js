const { stakings } = require('../helper/staking');

// Sonic
const contracts = [
  '0xBD87A909F9A40FdaD6D9BE703E89A0383064D0Ab', // ebFox
  '0x3725B740b33E75898e4e2E616E9BB519884edd37', // FoxMaxi
];

module.exports = {
  methodology: 'Counts the totalSupply of Foxify protocol tokens staked in the protocol',
  sonic: {
    tvl: stakings(contracts, '0x261dfa2528dfa19011f10b168c856e02baaf0eb6'),
    staking: stakings(contracts, '0x261dfa2528dfa19011f10b168c856e02baaf0eb6')
  },
};