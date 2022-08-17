const { staking } = require('../helper/staking');

const stakingContractRoundThree = '0x3333B155fa21A972D179921718792f1036370333';
const stakingToken = '0x8e3bcc334657560253b83f08331d85267316e08a'; // BRBC token (bsc)

module.exports = {
  timetravel: false,
  methodology: 'Staking pool balance',
  bsc: {
    staking: staking(stakingContractRoundThree, stakingToken, 'bsc')
  },
  tvl: () => ({})
}
