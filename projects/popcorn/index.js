const sdk = require('@defillama/sdk');
const { staking } = require('./staking')
const { ADDRESSES } = require("./constants");
const { addButterV2TVL, addThreeXTVL } = require("./butter")
const { addStakingPoolsTVL } = require("./stakingPools")
const { getLpTokenTVL } = require("./lpTokens")

function getTVL(chain = undefined) {
  return async (timestamp, block, chainBlocks) => {
    let balances = {};
    if (chain && chain === 'ethereum') {
      await addButterV2TVL(balances, timestamp, chainBlocks, chain);
      await addThreeXTVL(balances, timestamp, chainBlocks, chain);
    }
    await addStakingPoolsTVL(balances, timestamp, chainBlocks, chain)
    return balances;
  }
}

module.exports = {
  timetravel: true,
  methodology: ``,
  ethereum: {
    staking: staking(true, [ADDRESSES.ethereum.popLocker], ADDRESSES.ethereum.pop,),
    pool2: getLpTokenTVL(),
    start: 12237585,
    tvl: getTVL('ethereum'),
  },
  bsc: {
    staking: staking(false, undefined, undefined, 'bsc'),
    tvl: getTVL('bsc'),
  },
  polygon: {
    staking: staking(true, [ADDRESSES.polygon.popLocker], ADDRESSES.polygon.pop, 'polygon'),
    pool2: getLpTokenTVL("polygon"),
    tvl: getTVL('polygon'),
  },
  arbitrum: {
    staking: staking(false, undefined, undefined, 'arbitrum'),
    tvl: getTVL('arbitrum'),
  }
};