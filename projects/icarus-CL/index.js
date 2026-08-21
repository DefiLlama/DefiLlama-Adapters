const { getUniTVL } = require('../helper/unknownTokens.js')

const CL_FACTORY = '0x6f7DA11c13Ba09A153dA06d376044e5859Db607B'

const tvl = getUniTVL({
  factory: CL_FACTORY,
  fetchBalances: true,
  abis: {
    allPairsLength: 'uint256:allPoolsLength',
    allPairs: 'function allPools(uint256) view returns (address)',
  },
})

module.exports = {
  start: '2026-01-26',
  methodology: 'Value of the tokens locked in concentrated-liquidity pools.',
  rise: { tvl },
}
