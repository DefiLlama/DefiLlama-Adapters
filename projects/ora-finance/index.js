const { unknownTombs } = require('../helper/unknownTokens')

const oraTokenAddress = "0xCda8e67F3457Db7c8A62F7EaAdbaB74bfd29BeC8";
const oshareTokenAddress = "0xdcefBd8f92683541e428DD53Cd31356f38d69CaA";
const oshareRewardPoolAddress = "0xa18d290144C684349b1Cc4fC8501707cd7724f74";
const boardroomAddress = "0xCF0c385aE8225EFF591bA4a7637cF688Bf012A16";

const OraLPs = [
  "0x1203f76D98c103DFDa350C0b7F7323475Ee24aE3", // oraAuroraLpAddress
  "0x7939e155b222c804FCDd0d0297922BBEf6F64897", //oshareAuroraLpAddress
];

module.exports = unknownTombs({
  lps: OraLPs,
  token: oraTokenAddress,
  shares: [oshareTokenAddress],
  rewardPool: [oshareRewardPoolAddress,],
  masonry: [boardroomAddress],
  chain: 'aurora',
  useDefaultCoreAssets: true,
})
module.exports.methodology = "Pool2 deposits consist of ORA/AURORA and OSHARE/AURORA LP tokens deposits while the staking TVL consists of the OSHARES tokens locked within the Boardroom."
