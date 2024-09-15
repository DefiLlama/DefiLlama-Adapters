const { getLogs } = require('../helper/cache/getLogs')
const { transformDexBalances } = require('../helper/portedTokens')

const config = {
  avax: { factory: '0x2131Bdb0E0B451BC1C5A53F2cBC80B16D43634Fa', fromBlock: 46372045 },
}

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})


async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
    eventAbi: 'event PairCreated(address indexed token0, address indexed token1, address pair, uint256 )',
    onlyArgs: true,
    fromBlock,
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