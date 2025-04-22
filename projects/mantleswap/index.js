const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')


module.exports = {
  misrepresentedTokens: true,
    mantle: {
        tvl
    }
}

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0x5c84e5d27fc7575D002fe98c5A1791Ac3ce6fD2f',
    topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
    eventAbi: 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256 )',
    onlyArgs: true,
    fromBlock: 5964,
  })
  const tok0Bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: logs.map(i => ({ target: i.token0, params: i.pair}))})
  const tok1Bals = await api.multiCall({  abi: 'erc20:balanceOf', calls: logs.map(i => ({ target: i.token1, params: i.pair}))})
  return transformDexBalances({ chain: api.chain, data: logs.map((log, i) => ({
    token0: log.token0,
    token0Bal: tok0Bals[i],
    token1: log.token1,
    token1Bal: tok1Bals[i],
  }))})
  
}