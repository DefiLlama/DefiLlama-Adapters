const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require("../helper/portedTokens");

const FACTORY = '0x9Fe607e5dCd0Ea318dBB4D8a7B04fa553d6cB2c5'

async function getFactoryLogs(api) {
  return getLogs({
    api,
    target: FACTORY,
    fromBlock: 1150,
    topic: 'PoolCreated(address,address,uint24,int24,address)',
    eventAbi: 'event PoolCreated(address indexed token0,address indexed token1,uint24 indexed swapFeeUnits,int24 tickDistance,address pool)',
    onlyArgs: true,
  })
}

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const factoryLogs = await getFactoryLogs(api)
  let data = []

  const [tokenBalances0, tokenBalances1] = await Promise.all([
    api.multiCall({
      abi: 'erc20:balanceOf',
      calls: factoryLogs.map(({token0, pool}) => ({
        target: token0,
        params: pool
      })),
      permitFailure: true,
    }),
    api.multiCall({
      abi: 'erc20:balanceOf',
      calls: factoryLogs.map(({token1, pool}) => ({
        target: token1,
        params: pool
      })),
      permitFailure: true,
    })
    ])

  for (let i = 0; i < factoryLogs.length; i++) {
    data.push({ token0Bal: tokenBalances0[i], token1Bal: tokenBalances1[i], token0: factoryLogs[i].token0, token1: factoryLogs[i].token1, })
  }

  return transformDexBalances({ data, chain: api.chain })
}

module.exports = {
  linea: { tvl, }
}
