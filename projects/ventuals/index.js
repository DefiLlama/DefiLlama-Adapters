const ADDRESSES = require('../helper/coreAssets.json')
const { getHypercoreStakedHype } = require('../helper/chain/hyperliquid')

const stakingVault = '0x8888888192a4A0593c13532Ba48449FC24C3bEDA'

const tvl = async (api) => {
  await api.sumTokens({ owners: [stakingVault], tokens: [ADDRESSES.null] })
  const staked = await getHypercoreStakedHype(stakingVault)
  api.addGasToken(staked)
}

module.exports = {
  timetravel: false,
  methodology: 'Counts HYPE held by the Ventuals StakingVault on HyperEVM plus HYPE delegated on HyperCore that backs vHYPE.',
  hyperliquid: { tvl },
}
