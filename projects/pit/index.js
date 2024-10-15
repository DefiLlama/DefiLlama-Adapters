const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
  let data = await getConfig('pit/' + api.chain, `https://ydaemon.pit.finance/vaults/all?chainids=${api.chainId}&limit=100000`)
  let strategies = data.map(v => v.strategies ?? []).flat().map(v => v.address.toLowerCase())
  let vaults = data.filter(i => i.tvl.tvl > 0).map(v => v.address.toLowerCase()).filter(i => !strategies.includes(i))
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  const calls = [...vaults]
  bals.forEach((bal, i) => {
    if (+bal === 0)
      calls[i] = nullAddress // skip empty vaults
  })
  const tokens = await api.multiCall({ abi: 'address:token', calls, permitFailure: true })

  tokens.forEach((token, i) => {
    if (token)
      calls[i] = nullAddress // skip vaults that have a token
  })
  const tokensAlt = await api.multiCall({ abi: 'address:asset', calls, permitFailure: true })
  bals.forEach((bal, i) => {
    const token = tokens[i] || tokensAlt[i]
    if (token) api.add(token, bal)
  })
  return sumTokens2({ api, resolveLP: true, })
}


module.exports = {
  doublecounted: true
}

const chains = ['sei']

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
