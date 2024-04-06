async function tvl(api) {
  const { lending: lendingContract, feeManager } = config[api.chain]
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
}

const config = {
  ethereum: { lending: '0x37e49bf3749513A02FA535F0CbC383796E8107E4', feeManager: '0x0bc24e61daad6293a1b3b53a7d01086bff0ea6e5' },
  arbitrum: { lending: '0x9034a49587bd2c1af27598e0f04f30db66c87ebf', feeManager: '0x90a022796798f9dbA1Da0f8645234B284d4E8EC6' },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {    tvl  }
})
