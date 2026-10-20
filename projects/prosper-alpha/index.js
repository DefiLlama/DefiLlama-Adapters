const getMarkets = require('./markets')

async function tvl(api) {
  const markets = (await getMarkets(api)).map(({ market }) => market)
  if (!markets.length) return
  const [tokens, reserves] = await Promise.all([
    api.multiCall({ abi: 'address:wrappedNative', calls: markets }),
    api.multiCall({ abi: 'uint256:realWrappedNativeReserve', calls: markets }),
  ])
  api.addTokens(tokens, reserves)
}

module.exports = {
  methodology: 'Counts real wrapped-native reserves in Prosper bonding-curve markets on Pharos, discovered through the production Factory creation events. Excludes virtual reserves, pToken market capitalization, external Vault AUM and migrated DEX liquidity, which is tracked separately.',
  start: '2026-09-13',
  pharos: { tvl },
}
