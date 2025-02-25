const protocolConfig = [
  {
    protocol: '0xc0fA386aE92f18A783476d09121291A1972C30Dc',
    treasury: "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a"
  },
  {
    protocol: '0x4737c3BAB13a1Ad94ede8B46Bc6C22fb8bBE9c81',
    treasury: "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a"
  }
]

async function tvl(api) {
  let tokensAndOwners = []
  
  for (const { protocol, treasury } of protocolConfig) {
    const tokens = await api.call({ abi: 'address[]:assetTokens', target: protocol })
    tokens.forEach(token => tokensAndOwners.push([token, treasury]))
  }
  
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  berachain: {
    tvl,
  }
}