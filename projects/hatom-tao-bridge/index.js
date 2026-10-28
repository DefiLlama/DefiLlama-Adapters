const { getTokenData } = require('../helper/chain/elrond')

// Wrapped TAO, minted on MultiversX against the TAO the bridge custodies on Bittensor
const WTAO = 'WTAO-4f5363'

// The Bittensor custody rotates across wallets, so the locked TAO is measured from the minted
// side instead. Supply is derived from mint and burn totals because the token endpoint rounds
// the supply field down to whole TAO.
const tvl = async (api) => {
  const { minted, burnt, decimals } = await getTokenData(WTAO)
  api.addCGToken('bittensor', Number(BigInt(minted) - BigInt(burnt)) / 10 ** decimals)
}

module.exports = {
  timetravel: false,
  methodology: 'Counts the TAO locked in the bridge as the circulating supply of WTAO on MultiversX, which the bridge mints one for one against the TAO it custodies on Bittensor.',
  bittensor: { tvl },
}
