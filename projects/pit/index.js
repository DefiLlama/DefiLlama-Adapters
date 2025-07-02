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

  // directional vaults
  const directionalVaults = [
    "0x64bb275066E7275FB0803c3e617Ae3ab2A882fF3",
    "0x634B69cC4168Cfc1c366078FDeB874AfFBb478b5",
    "0x088dBBeEC1489c557f8D4fD6146E0590E303d7d9",
    "0xFFf0d064B1cbf5D4C97D0af56a73a4C7e31DFb0D",
    "0x842E97BaA96cFE1534F1A50Da112C7800134656A",
    "0x46706780749bC41E7Ab99D13BC1B2a74Df40A7DA",
    "0x5DcEFCa5207c58dCbcf41eF017D1D0EB42d83701",
    "0x4573382A9d101EB6DFa1C4B448f939c41fF3e81d"
  ]

  const directionalTokens = await api.multiCall({ abi: 'address:collateral', calls: directionalVaults, permitFailure: true })
  const directionalATokens = await api.multiCall({ abi: 'address:aToken', calls: directionalVaults, permitFailure: true })
  const tokensAndOwners = []
  directionalVaults.forEach((vault, i) => {
    if (directionalTokens[i]) {
      tokensAndOwners.push([directionalTokens[i], vault])
    }
    if (directionalATokens[i]) {
      tokensAndOwners.push([directionalATokens[i], vault])
    }
  })

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  doublecounted: true
}

const chains = ['sei']

chains.forEach(chain => {
  module.exports[chain] = { tvl }
})
