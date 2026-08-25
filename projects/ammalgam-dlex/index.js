const FACTORY = '0x1a411b0fd1f368d2f413a8cbb6aad425c923015b'

const abi = {
  allPairsLength: 'uint256:allPairsLength',
  allPairs: 'function allPairs(uint256) view returns (address)',
  underlyingTokens: 'function underlyingTokens() view returns (address tokenX, address tokenY)',
  getReserves:
    'function getReserves() view returns (uint112 reserveXAssets, uint112 reserveYAssets, uint32 lastTimestamp)',
}

const getTokenX = tokens => tokens.tokenX ?? tokens[0]
const getTokenY = tokens => tokens.tokenY ?? tokens[1]
const getReserveX = reserves => reserves.reserveXAssets ?? reserves[0]
const getReserveY = reserves => reserves.reserveYAssets ?? reserves[1]

/**
 * Fetches all Ammalgam pairs with their underlying tokens and swap reserves.
 */
async function getPairData(api) {
  const pairs = await api.fetchList({
    target: FACTORY,
    lengthAbi: abi.allPairsLength,
    itemAbi: abi.allPairs,
  })

  const [underlyingTokens, reserves] = await Promise.all([
    api.multiCall({ abi: abi.underlyingTokens, calls: pairs }),
    api.multiCall({ abi: abi.getReserves, calls: pairs }),
  ])

  return { pairs, underlyingTokens, reserves }
}

/**
 * Adds only tokenX/tokenY reserve assets used for swaps.
 */
async function tvl(api) {
  const { underlyingTokens, reserves } = await getPairData(api)

  reserves.forEach((reserve, index) => {
    api.add(getTokenX(underlyingTokens[index]), getReserveX(reserve))
    api.add(getTokenY(underlyingTokens[index]), getReserveY(reserve))
  })
}

module.exports = {
  methodology:
    'Ammalgam DLEX reserve TVL counts only swap reserves: tokenX and tokenY reserve assets returned by getReserves() for every pair created by the Ethereum factory. Broader supplied and borrowed DLEX liquidity is excluded from this reserve-only view.',
  start: '2026-07-03',
  ethereum: { tvl },
}
