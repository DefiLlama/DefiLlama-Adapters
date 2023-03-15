const { multicall, sumTokens } = require('../helper/chain/tron')

const contracts = [
  'TC3TuowSyMxJSLaqiWJuCkZ2i3q7JCFR4x',
  'TGxDz3kgbxwEAESNtfWk4JFXXEgZAoWqeG',
  'TVMuhpXdRvNjjFAWqZ5urvhrQQyFvc19SN',
  'TJmx4Zg4xMjCZR5Q3aoCyDmYY3r42xU2GZ',
  'TMiHbWfnzh8cFmxNptoDgBvhuFSe2eiDFQ',
  'TVR8KWCV21nAM6Epifzh73Y9wy8GFzKdBP',
  'TWxrUkHSSHwJoNtLPJimVmgKhmwVGvhwUZ',
  'TSbbCH6nss56q1D2NtSKquuNPYZ2ZDyKZg',
  'TPxT4UrAkbp4fK4CtjuMmvS9u85HjU7EYq',
  'TEEQvDKY9sFQ65xxwhSH4QBkLD2NtwoN4a',
  'TUHHCVD4MR7LXthbS2fBBw5bXARhBg4k5G',
  'TPfAqGJ83NbVcRcsMFx7GJ749t9VV6cZvp',
]

async function tvl() {
  const tokenAs = await multicall({ calls: contracts, abi: 'tokenA()', isAddress: true,})
  const tokenBs = await multicall({ calls: contracts, abi: 'tokenB()', isAddress: true,})
  const tokensAndOwners = []
  tokenAs.forEach((t, i) => tokensAndOwners.push([t, contracts[i]]))
  tokenBs.forEach((t, i) => tokensAndOwners.push([t, contracts[i]]))
  return sumTokens({ tokensAndOwners, })
}

module.exports = {
  tron: {
    tvl,
  },
}
