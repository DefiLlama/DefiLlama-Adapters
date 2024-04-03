const { getConfig } = require('../helper/cache')
const { getUniqueAddresses } = require('../helper/utils')

async function tvl(api) {
  const res = await getConfig('sovryn', 'https://backend.sovryn.app/tvl')
  let pools = Object.values(res.tvlLending).map(i => i?.contract).filter(i => i)
  pools = getUniqueAddresses(pools)
  const tokens = await api.multiCall({ abi: 'address:loanTokenAddress', calls: pools })
  return api.sumTokens({ tokensAndOwners2: [tokens, pools] })
}

async function borrowed(api) {
  const res = await getConfig('sovryn', 'https://backend.sovryn.app/tvl')
  let pools = Object.values(res.tvlLending).map(i => i?.contract).filter(i => i)
  pools = getUniqueAddresses(pools)
  const tokens = await api.multiCall({ abi: 'address:loanTokenAddress', calls: pools })
  const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: pools })
  const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pools.map((v, i) => ({ target: tokens[i], params: v })) })
  api.addTokens(tokens, supplies)
  bals.forEach((bal, i) => {
    const token = tokens[i]
    api.add(token, bal * -1)
  })
  const balances = api.getBalances()
  Object.entries(balances).forEach(([token, bal]) => {
    if (+bal < 0) delete balances[token]
  })
  return balances
}

module.exports = {
  rsk: { tvl, borrowed, }
}