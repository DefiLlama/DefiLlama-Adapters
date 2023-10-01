const { staking, stakingPricedLP } = require('../helper/staking');
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY =  '0xaC7B7EaC8310170109301034b8FdB75eCa4CC491';

const startBlocks = {
    avax: 28094493
}

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks, { api }) => {
    const  START_BLOCK = startBlocks[chain]
    const logs = await getLogs({
        api,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: 'Pool(address,address,address)',
        eventAbi: 'event Pool(address indexed token0, address indexed token1, address pool)',
        onlyArgs: true,
      })
    const toa = []
    logs.forEach(({ token0, token1, pool}) => toa.push([token0, pool], [token1, pool]))
    return sumTokens2({ api, tokensAndOwners: toa })
  }
}

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: chainTvl('avax'),
    staking: stakingPricedLP("0xed1eE3f892fe8a13A9BE02F92E8FB7410AA84739", "0x3712871408a829C5cd4e86DA1f4CE727eFCD28F6", "avax", "0x2071a39da7450d68e4f4902774203df208860da2", "avalanche-2"),
  },
};
