const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY =  '0xa2A92Bb449CCa49b810C84c0efC36a88431655f2';

const startBlocks = {
    avax: 31662680
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
  avax: {
    tvl: chainTvl('avax'),
  }
}