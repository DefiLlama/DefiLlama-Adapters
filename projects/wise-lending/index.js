const lendingContract = '0x37e49bf3749513A02FA535F0CbC383796E8107E4'
const feeManager = '0x0bc24e61daad6293a1b3b53a7d01086bff0ea6e5'

async function tvl(_, _b, _cb, { api, }) {
  const pools = await api.fetchList({ lengthAbi: 'uint256:getPoolTokenAddressesLength', itemAbi: 'function getPoolTokenAdressesByIndex(uint256) view returns (address)', target: feeManager })
  const isATokens = await api.multiCall({ abi: 'function isAaveToken(address) view returns (bool)', calls: pools, target: feeManager })
  const aTokens = pools.filter((_, i) => isATokens[i])
  const otherTokens = pools.filter((_, i) => !isATokens[i])
  const uaTokens = await api.multiCall({ abi: 'function underlyingToken(address) view returns (address)', calls: aTokens, target: feeManager })
  return api.sumTokens({ owner: lendingContract, tokens: [...otherTokens, ...uaTokens] })
}

module.exports = {
  hallmarks: [
    [1705017600,"Project Exploited"]
  ],
  ethereum: {
    tvl
  }
}
