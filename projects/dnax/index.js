const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const VAULT = '0xafc43faE32302D725fC4d448525c44c522a9a1B9'
const NATIVE_PLACEHOLDER = ADDRESSES.GAS_TOKEN_2

const pairsAbi = 'function pairs() external view returns (address[2][])'

module.exports = {
  methodology: 'Reads the DNAX vault `pairs` list, then sums the balances of every listed token plus native BNB held by the vault.',
  bsc: {
    tvl: async (api) => {
      const pairs = await api.call({ target: VAULT, abi: pairsAbi })
      const tokenSet = new Set()

      pairs.forEach(([token0, token1]) => {
        if (token0) tokenSet.add(formatToken(token0))
        if (token1) tokenSet.add(formatToken(token1))
      })

      tokenSet.delete(undefined)

      return sumTokens2({
        api,
        owner: VAULT,
        tokens: Array.from(tokenSet),
        permitFailure: true,
      })
    },
  },
}

function formatToken(token) {
  const normalized = token.toLowerCase()
  if (normalized === NATIVE_PLACEHOLDER) return nullAddress
  if (normalized === ADDRESSES.null) return nullAddress
  return normalized
}

