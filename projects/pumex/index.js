const { getUniTVL } = require('../helper/unknownTokens')

const FACTORY = '0x105A0A9c1D9e29e0D68B746538895c94468108d2'

const tvl = (() => {
  const v1 = getUniTVL({ factory: FACTORY, hasStablePools: true })
  const v2 = getUniTVL({
    factory: FACTORY,
    hasStablePools: true,
    permitFailure: true,
    abis: {
      allPairsLength: 'uint256:allPoolsLength',
      allPairs: 'function allPools(uint256) view returns (address)',
    },
  })

  return async (...args) => {
    try {
      return await v1(...args)
    } catch (e) {
      return v2(...args)
    }
  }
})()

module.exports = {
  misrepresentedTokens: true,
  injective_evm: {
    tvl,
    start: 137690039,
  },
  methodology: 'TVL is calculated as the total liquidity in all pools created by the Pumex factory.',
}
