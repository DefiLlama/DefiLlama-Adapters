// Dex.LiquidityPool: map Twox64Concat TradingPair(CurrencyId, CurrencyId) => (Balance, Balance), read over HTTP JSON-RPC
const { getStorageEntries, stripHasher, ScaleReader } = require('../chain/substrate')
const { readCurrencyId, currencyName } = require('./currency')
const { transformDexBalances } = require('../portedTokens')

async function dex(chain) {
  const entries = await getStorageEntries(chain, { pallet: 'Dex', item: 'LiquidityPool' })

  const dexData = entries.map(({ rest, value }) => {
    const key = new ScaleReader(stripHasher(rest, 'Twox64Concat'))
    const token0 = readCurrencyId(key)
    const token1 = readCurrencyId(key)
    const amounts = new ScaleReader(value)
    return {
      token0: currencyName(chain, token0),
      token0Bal: Number(amounts.u128()),
      token1: currencyName(chain, token1),
      token1Bal: Number(amounts.u128()),
    }
  })

  return transformDexBalances({ chain, data: dexData })
}

module.exports = {
  dex
}
