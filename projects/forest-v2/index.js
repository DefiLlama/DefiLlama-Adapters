const FOREST_TOKEN = '0x11cf6bf6d87cb0eb9c294fd6cbfec91ee3a1a7d0'
const V2_FACTORY = '0x8ad812a372b4c5aa1fc478b720f2adad42002f81'

async function getV2Pairs(api) {
  const raw = await api.fetchList({ lengthAbi: 'uint256:allPairsLength', itemAbi: 'function allPairs(uint256) view returns (bytes32)', target: V2_FACTORY })
  return raw.map(r => '0x' + r.slice(-40))
}

async function tvl(api) {
  const pairs = await getV2Pairs(api)
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: pairs }),
    api.multiCall({ abi: 'address:token1', calls: pairs }),
  ])
  const tokensAndOwners = []
  for (let i = 0; i < pairs.length; i++) {
    if (token0s[i].toLowerCase() !== FOREST_TOKEN) tokensAndOwners.push([token0s[i], pairs[i]])
    if (token1s[i].toLowerCase() !== FOREST_TOKEN) tokensAndOwners.push([token1s[i], pairs[i]])
  }
  await api.sumTokens({ tokensAndOwners })
}

async function staking(api) {
  const pairs = await getV2Pairs(api)
  await api.sumTokens({ owners: pairs, tokens: [FOREST_TOKEN] })
}

module.exports = {
  bsc: { tvl, staking },
}
