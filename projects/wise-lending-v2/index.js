
async function tvl(api) {
  const { lending: lendingContract, feeManager } = config[api.chain]
  const pools = await api.fetchList({ lengthAbi: 'uint256:getPoolTokenAddressesLength', itemAbi: 'function getPoolTokenAdressesByIndex(uint256) view returns (address)', target: feeManager })
  const isATokens = await api.multiCall({ abi: 'function isAaveToken(address) view returns (bool)', calls: pools, target: feeManager })
  const aTokens = pools.filter((_, i) => isATokens[i])
  let otherTokens = pools.filter((_, i) => !isATokens[i])
  const names = await api.multiCall({ abi: 'string:name', calls: otherTokens })
  const pendleTokens = otherTokens.filter((_, i) => names[i].includes(' Pendle '))
  otherTokens = otherTokens.filter(i => !pendleTokens.includes(i))
  const uaTokens = await api.multiCall({ abi: 'function underlyingToken(address) view returns (address)', calls: aTokens, target: feeManager })

  // unwrap pendle
  const pBals = await api.multiCall({ abi: 'erc20:balanceOf', calls: pendleTokens.map(t => ({ target: t, params: lendingContract })) })
  const pSupply = await api.multiCall({ abi: 'erc20:totalSupply', calls: pendleTokens })
  const pTotalAssets = await api.multiCall({ abi: 'uint256:totalLpAssets', calls: pendleTokens })
  const pUnderlying = await api.multiCall({ abi: 'address:UNDERLYING_PENDLE_MARKET', calls: pendleTokens })

  pUnderlying.forEach((token, i) => {
    api.add(token, pBals[i] * pTotalAssets[i] / pSupply[i])
  })

  return api.sumTokens({ owner: lendingContract, tokens: [...otherTokens, ...uaTokens], })
}

const config = {
  arbitrum: { lending: '0x9034a49587bd2c1af27598e0f04f30db66c87ebf', feeManager: '0x90a022796798f9dbA1Da0f8645234B284d4E8EC6' },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
