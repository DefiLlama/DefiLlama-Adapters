// LCDOT supply: Tokens.TotalIssuance(CurrencyId::LiquidCrowdloan(13)) read over HTTP JSON-RPC
const { getStorage, decodeUint, encodeU32 } = require('../chain/substrate')

// Acala CurrencyId enum: Token=0, DexShare=1, Erc20=2, StableAssetPoolToken=3, LiquidCrowdloan=4, ForeignAsset=5
const LIQUID_CROWDLOAN = 4
const currencyIdLiquidCrowdloan = (lease) => Buffer.concat([Buffer.from([LIQUID_CROWDLOAN]), encodeU32(lease)])

async function staking(chain, lease = 13) {
  const supply = decodeUint(await getStorage(chain, { pallet: 'Tokens', item: 'TotalIssuance', key: currencyIdLiquidCrowdloan(lease) }))
  return { polkadot: Number(supply) / 1e10 }
}

module.exports = {
  staking,
}
