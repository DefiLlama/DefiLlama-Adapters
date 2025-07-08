const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const ixETH = '0x535321013A1E2D5aF3B1853812a64CA3fc6C1fa1'
  const tokens = await api.call({ abi: 'address[]:getLSDTokens', target: ixETH })
  const strategies = await api.multiCall({ abi: 'function lsdAdapters(address) view returns (address)', calls: tokens, target: ixETH, })
  const tokensAndOwners2 = [tokens, strategies]
  return sumTokens2({ api, tokensAndOwners2, })
}

module.exports = {
  ethereum: { tvl }
}