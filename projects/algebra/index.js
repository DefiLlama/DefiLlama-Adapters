const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking');

const FACTORY =  '0x8C1EB1e5325049B412B7E71337116BEF88a29b3A';

const startBlocks = {
    polygon: 22518977
}

function chainTvl(chain) {
  return async (api) => {
    const  START_BLOCK = startBlocks[chain]
    const logs = await getLogs({
        api,
        target: FACTORY,
        fromBlock: START_BLOCK,
        topic: 'PoolCreated(address,address,address)',
        eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, address pool)',
        onlyArgs: true,
      })
    const toa = []
    logs.forEach(({ token0, token1, pool}) => toa.push([token0, pool], [token1, pool]))
    return sumTokens2({ api, tokensAndOwners: toa })
  }
}

module.exports = {
  polygon: {
    tvl: chainTvl('polygon'),
    staking: staking('0x32CFF674763b06B983C0D55Ef2e41B84D16855bb', '0x0169ec1f8f639b32eec6d923e24c2a2ff45b9dd6')
  }
}