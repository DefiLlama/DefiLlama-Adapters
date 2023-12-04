const lendingContract = '0x84524baa1951247b3a2617a843e6ece915bb9674'
const feeManager = '0x0bc24e61daad6293a1b3b53a7d01086bff0ea6e5'

async function tvl(_, _b, _cb, { api, }) {
  const pools = await api.fetchList({ lengthAbi: 'uint256:getPoolTokenAddressesLength', itemAbi: 'function getPoolTokenAdressesByIndex(uint256) view returns (address)', target: feeManager })
  const isATokens = await api.multiCall({ abi: 'function isAaveToken(address) view returns (bool)', calls: pools, target: feeManager })
  const aTokens = pools.filter((_, i) => isATokens[i])
  const otherTokens = pools.filter((_, i) => !isATokens[i])
  const uaTokens = await api.multiCall({ abi: 'function underlyingToken(address) view returns (address)', calls: aTokens, target: feeManager })
  const aBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: aTokens.map(i => ({ target: i, params: lendingContract })) })
  api.addTokens(uaTokens, aBals)
  return api.sumTokens({ owner: lendingContract, tokens: otherTokens })
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  ethereum: {
    tvl
  }
}