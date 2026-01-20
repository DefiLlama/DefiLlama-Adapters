const protocolConfig = [
  {
    protocol: '0xc0fA386aE92f18A783476d09121291A1972C30Dc',
    treasury: "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a"
  },
  {
    protocol: '0x4737c3BAB13a1Ad94ede8B46Bc6C22fb8bBE9c81',
    treasury: "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a"
  },
  {
    protocol: '0x9F0956c33f45141a7D8D5751038ae0A71C562f87',
    treasury: "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a"
  },
  {
    protocol: '0xd75Dc0496826FF0C13cE6D6aA5Bf8D64126E4fF1',
    treasury: "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a"
  }
]

async function tvl(api) {
  let ownerTokens = []
  const tokens = await api.multiCall({  abi: 'address[]:assetTokens', calls: protocolConfig.map(i => i.protocol)})
  tokens.forEach((v, i) => ownerTokens.push([v, protocolConfig[i].treasury]))
  return api.sumTokens({ ownerTokens })
}

module.exports = {
  berachain: {
    tvl,
  }
}