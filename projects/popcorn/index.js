const sdk = require('@defillama/sdk');
const { staking } = require('./staking')
const { ADDRESSES } = require("./constants");
const { addButterV2TVL, addThreeXTVL } = require("./butter")
const { addStakingPoolsTVL } = require("./stakingPools")
const { addVaultToTVL } = require("./vault");

const vaultChains = Object.keys(ADDRESSES).filter(chain => Object.keys(ADDRESSES[chain]).includes('vaultRegistry'));

function getTVL(chain = undefined) {
  return async (timestamp, block, chainBlocks, { api }) => {
    let balances = {};
    if (chain && chain === 'ethereum') {
      await addButterV2TVL(balances, timestamp, chainBlocks, chain);
      await addThreeXTVL(balances, timestamp, chainBlocks, chain);
    }

    if (chain && vaultChains.includes(chain)) {
      await addVaultToTVL(balances, api, ADDRESSES[chain].vaultRegistry);
    }
    return balances;
  }
}

function getLPTokensStakedTVL(chain = undefined) {
  return async (timestamp, block, chainBlocks) => {
    let balances = {};
    await addStakingPoolsTVL(balances, timestamp, chainBlocks, chain)
    return balances;
  }
}

module.exports = {
  timetravel: true,
  methodology: ``,
  ethereum: {
    staking: staking(true, [ADDRESSES.ethereum.popLocker], ADDRESSES.ethereum.pop,),
    //pool2: getLPTokensStakedTVL('ethereum'),
    start: 12237585,
    tvl: getTVL('ethereum'),
  },
  bsc: {
    staking: staking(false, undefined, undefined, 'bsc'),
    tvl: getTVL('bsc'),
  },
  polygon: {
    staking: staking(true, [ADDRESSES.polygon.popLocker], ADDRESSES.polygon.pop, 'polygon'),
    //pool2: getLPTokensStakedTVL("polygon"),
    tvl: getTVL('polygon'),
  },
  arbitrum: {
    staking: staking(false, undefined, undefined, 'arbitrum'),
    tvl: getTVL('arbitrum'),
  }
};