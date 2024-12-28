const { sumTokens2 } = require("../helper/unwrapLPs")

async function tvl(api) {
  const pairs = await api.call({ abi: 'address[]:getAllPairs', target: '0x485eac14fafb515f16f87da5e4b59018546a335e' })
  const tokens = await Promise.all(pairs.map(p => api.fetchList({ target: p, lengthAbi: 'uint256:coin_length', itemAbi: 'function coins(uint256 i) view returns (address)' })))
  const ownerTokens = tokens.map((v, i) => [v, pairs[i]])
  return sumTokens2({ api, ownerTokens,})
}

module.exports = {
  klaytn: { tvl }
}