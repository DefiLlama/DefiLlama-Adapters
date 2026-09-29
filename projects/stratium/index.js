const ADDRESSES = require('../helper/coreAssets.json')
const { getHypercoreStakedHype } = require('../helper/chain/hyperliquid')

const STAKING_VAULT = '0x3F790D0080a5257a1AEfb257DDCDc19579a8998F'

async function tvl(api) {
  await api.sumTokens({ owners: [STAKING_VAULT], tokens: [ADDRESSES.null] })
  api.addGasToken(await getHypercoreStakedHype(STAKING_VAULT))
}

module.exports = {
  timetravel: false,
  methodology: "Counts the underlying HYPE controlled by Stratium's StakingVault: HYPE held by the vault on HyperEVM plus HYPE delegated or undelegated on HyperCore for the vault address. Excludes future HIP-3 market fees, volume, revenue, and any non-staking protocol activity.",
  hyperliquid: { tvl },
}
