const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const { factory, fromBlock, } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0x8e74ffd51819fef95a58370a621a4ba82cae11062f357bf636c4cca361812ddf'],
    fromBlock,
    eventAbi: 'event NewStableSwapPair(address indexed pool, address indexed token0, address indexed token1, uint256 A, uint256 fee, uint256 adminFee)',
    onlyArgs: true,
  })
  return sumTokens2({ api, ownerTokens: logs.map(({ pool, token0, token1 }) => ([[token0, token1], pool])) })
} 

const config = {
  btr: { factory: '0x584E53b4D07b077fA6cc4302B0b457c04bbCC8Fa', fromBlock: 1736941 },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})