const { stakings } = require('../helper/staking');

const stakingContractRoundOne = '0x8d9Ae5a2Ecc16A66740A53Cc9080CcE29a7fD9F5';
const stakingContractRoundTwo =  '0xa96cdb86332b105065ca99432916e631e469cf5d';
const stakingContractRoundThree =  '0x3333B155fa21A972D179921718792f1036370333';
const stakingToken = '0x8e3bcc334657560253b83f08331d85267316e08a'; // BRBC token (bsc)

module.exports = {
  timetravel: false, // solana :cries:
  methodology: 'Staking pool balance',
  bsc: {
    tvl: () => ({}),
    staking: stakings([stakingContractRoundOne, stakingContractRoundTwo, stakingContractRoundThree, ], stakingToken),
  },
  hallmarks:[
    [1655991120, "Horizon bridge Hack $100m"],
  ],
  kava: {
    tvl: () => ({}),
  }
}
