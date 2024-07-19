const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const logs = await getLogs2({
    api,
    factory: '0x9767E409259E314F3C69fe1E7cA0D3161Bba4F5a',
    eventAbi: 'event PairCreated(address indexed token, address indexed weth, address pair)',
    fromBlock: 308542,
  })

  const wethBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: logs.map(i => ({ target: i.weth, params: i.pair })) })
  const tokens = logs.map(i => i.weth)
  api.add(tokens, wethBalances)
  api.add(tokens, wethBalances) // second time to add equivalent token value
  return sumTokens2({ api, })
}

module.exports = {
  misrepresentedTokens: true,
  etlk: { tvl }
}