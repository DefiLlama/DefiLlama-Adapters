const wTokens = [
  '0x1B01F8CEF529f8799532E5a015dD7Ec8Bf2a7513',
  '0x516fd25c9bb62C48395FE1963978d129Dc29fbd1',
  '0x0e2be97f03Ee98b466bEf1cc15CFd0Ca020abc85',
  '0x037a67590ac5AE9CA9ae3079Fab6562B2782acF2',
  '0x5c3aBD61DBc9192535011aCd211C388060862589',
  '0xC315A169F49B167870E7eecb8e7ee5d6275b47d8',
]

async function tvl(api) {

  const tokens = await api.multiCall({ calls: wTokens, abi: 'address:underlyingToken' })
  return api.sumTokens({ tokensAndOwners2: [tokens, wTokens] })
}

module.exports = {
  hyperliquid: { tvl },
}