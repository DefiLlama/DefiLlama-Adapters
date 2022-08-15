const { stakings } = require('../helper/staking');

const stakingContractRoundThree = '0x3333B155fa21A972D179921718792f1036370333';
const stakingToken = '0x8e3bcc334657560253b83f08331d85267316e08a'; // BRBC token (bsc)

function bscTvl() {
  return async (timestamp, ethBlock, chainBlocks) => {
    const chain = 'bsc';
    const block = chainBlocks[chain];
    const balances = {};
    const poolBalance = await sdk.api.erc20.balanceOf({
      target: usdcByChain[chain], owner: pools[chain], block, undefined, chain
    });

    sdk.util.sumSingleBalance(balances, chain+':'+usdcByChain[chain], poolBalance.output);

    return balances;
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Staking pool balance',
  bsc: {
    tvl: bscTvl(),
    staking: stakings([stakingContractRoundThree], stakingToken, 'bsc'),
  }
}
