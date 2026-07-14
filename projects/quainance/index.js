const { getLogs2 } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')


module.exports = {
  misrepresentedTokens: true,
  quai: {
    tvl
  }
}

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: '0x0018A110b6cA369DCf5Ab062C72F049E93B9eDe2',
    topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
    eventAbi: 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256 )',
    fromBlock: 8906017,
  })
  const tok0Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: logs.map(i => ({ target: i.token0, params: i.pair })) })
  const tok1Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: logs.map(i => ({ target: i.token1, params: i.pair })) })
  return transformDexBalances({
    chain: api.chain, data: logs.map((log, i) => ({
      token0: log.token0,
      token0Bal: tok0Bals[i],
      token1: log.token1,
      token1Bal: tok1Bals[i],
    }))
  })

}