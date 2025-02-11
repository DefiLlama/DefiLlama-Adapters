const zooProtocol = '0xc0fA386aE92f18A783476d09121291A1972C30Dc'
const treasury = "0x54C56e149F6D655Aa784678057D1f96612b0Cf1a"

async function tvl(api) {
  const tokens = await api.call({ abi: 'address[]:assetTokens', target: zooProtocol })
  const calls = tokens.map((token) => ({
    target: token,
    params: [treasury],
  }));
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls})
  api.add(tokens, balances)
}

module.exports = {
  berachain: {
    tvl,
  }
}