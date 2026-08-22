const FACTORY = '0x1a411b0fd1f368d2f413a8cbb6aad425c923015b'
const DEPOSIT_L = 0
const BORROW_L = 3
const BORROW_X = 4
const BORROW_Y = 5

const ceilDiv = (numerator, denominator) => (numerator + denominator - 1n) / denominator

async function getPairData(api) {
  const pairs = await api.fetchList({
    target: FACTORY,
    lengthAbi: 'uint256:allPairsLength',
    itemAbi: 'function allPairs(uint256) view returns (address)',
  })
  const underlyingTokens = await api.multiCall({
    abi: 'function underlyingTokens() view returns (address, address)',
    calls: pairs,
  })
  return { pairs, underlyingTokens }
}

async function tvl(api) {
  const { pairs, underlyingTokens } = await getPairData(api)
  const tokensAndOwners = pairs.flatMap((pair, i) =>
    underlyingTokens[i].map(token => [token, pair]))
  return api.sumTokens({ tokensAndOwners })
}

async function borrowed(api) {
  const { pairs, underlyingTokens } = await getPairData(api)
  const [allAssets, reserves] = await Promise.all([
    api.multiCall({
      abi: 'function totalAssetsAndShares(bool withInterest) view returns (uint112[6] allAssets, uint112[6] allShares)',
      calls: pairs.map(pair => ({ target: pair, params: [true] })),
    }),
    api.multiCall({
      abi: 'function getReserves() view returns (uint112 reserveXAssets, uint112 reserveYAssets, uint32 lastTimestamp)',
      calls: pairs,
    })
  ])
  pairs.forEach((_, i) => {
    const [tokenX, tokenY] = underlyingTokens[i]
    const assets = allAssets[i].allAssets
    const reserveXAssets = BigInt(reserves[i].reserveXAssets ?? reserves[i][0])
    const reserveYAssets = BigInt(reserves[i].reserveYAssets ?? reserves[i][1])
    const borrowLAssets = BigInt(assets[BORROW_L])
    const activeLiquidityAssets = BigInt(assets[DEPOSIT_L]) - borrowLAssets

    api.add(tokenX, assets[BORROW_X])
    api.add(tokenY, assets[BORROW_Y])

    if (borrowLAssets > 0n && activeLiquidityAssets > 0n) {
      api.add(tokenX, ceilDiv(borrowLAssets * reserveXAssets, activeLiquidityAssets))
      api.add(tokenY, ceilDiv(borrowLAssets * reserveYAssets, activeLiquidityAssets))
    }
  })
}

module.exports = {
  methodology: 'Ammalgam is a Decentralized Lending Exchange (DLEX), combining lending and trading in one pool primitive. TVL counts the underlying token balances held by every pair created by the Ammalgam factory. Borrowed counts assets borrowed out of the pairs, including direct token borrows and borrowed liquidity converted into its underlying token amounts.',
  ethereum: { tvl, borrowed },
}
