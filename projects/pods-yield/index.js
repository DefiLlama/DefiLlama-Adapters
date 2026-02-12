async function tvl(api) {
  const vaults = [
    '0xbab1e772d70300422312dff12daddcb60864bd41',
    '0x463F9ED5e11764Eb9029762011a03643603aD879',
    '0x5FE4B38520e856921978715C8579D2D7a4d2274F',
    '0x287f941aB4B5AaDaD2F13F9363fcEC8Ee312a969'
  ]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
}

module.exports = {
  ethereum: {
    tvl
  }
}
