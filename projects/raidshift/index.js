const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const contracts = [
  // 'TC3TuowSyMxJSLaqiWJuCkZ2i3q7JCFR4x',
  // 'TGxDz3kgbxwEAESNtfWk4JFXXEgZAoWqeG',
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
  const { api } = arguments[3]
  const tokenAs = await api.multiCall({ calls: contracts, abi: 'address:tokenA', permitFailure: true })
  const tokenBs = await api.multiCall({ calls: contracts, abi: 'address:tokenB', permitFailure: true })
  const tokensAndOwners = []
  tokenAs.forEach((t, i) => tokensAndOwners.push([fixNullToken(t), contracts[i]]))
  tokenBs.forEach((t, i) => tokensAndOwners.push([fixNullToken(t), contracts[i]]))
  return sumTokens2({ api, tokensAndOwners, blacklistedTokens: ['TNEjtKFHWpz8bN2ZruLVY2NW2AD39uSUAs']})


  function fixNullToken(token) {
    if (token === '0x') return nullAddress
    return token
  }}

module.exports = {
  tron: {
    tvl,
  },
}
