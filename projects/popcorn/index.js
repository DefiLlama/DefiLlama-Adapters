const sdk = require('@defillama/sdk');
const { staking } = require('./staking')
const { ADDRESSES } = require("./constants");
const { addButterV2TVL, addButterTVL } = require("./butter")
const { addRewardsEscrowTVL } = require("./rewardsEscrow")
const { getLpTokenTVL } = require("./lpTokens")

function getTVL(chain = undefined) {
  return async (timestamp, block, chainBlocks) => {
    let balances = {};
    await addRewardsEscrowTVL(balances, timestamp, chainBlocks, chain)
    if (chain && chain === 'ethereum') {
      // await addButterTVL(balances, timestamp, chainBlocks, chain)
      await addButterV2TVL(balances, timestamp, chainBlocks, chain)
    }
    return balances;
  }
}

module.exports = {
  timetravel: true,
  methodology: ``,
  ethereum: {
    staking: staking([ADDRESSES.ethereum.popLocker], ADDRESSES.ethereum.pop),
    pool2: getLpTokenTVL(),
    start: 12237585,
    tvl: getTVL('ethereum'),
  },
  bsc: {
    tvl: getTVL('bsc'),
  },
  polygon: {
    staking: staking([ADDRESSES.polygon.popLocker], ADDRESSES.polygon.pop, 'polygon'),
    pool2: getLpTokenTVL("polygon"),
    tvl: getTVL('polygon'),
  },
  arbitrum: {
    tvl: getTVL('arbitrum'),
  }
};