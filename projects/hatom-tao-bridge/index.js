const { getTokenData } = require('../helper/chain/elrond')

async function tvl(api) {
  const data = await getTokenData('WTAO-4f5363')
  const rawSupply = data?.circulatingSupply

  if (
    rawSupply === null ||
    rawSupply === undefined ||
    (typeof rawSupply !== 'number' && typeof rawSupply !== 'string') ||
    (typeof rawSupply === 'string' && rawSupply.trim() === '')
  ) {
    throw new Error(`Invalid WTAO-4f5363 circulatingSupply: ${rawSupply}`)
  }

  const supply = Number(rawSupply)

  if (!Number.isFinite(supply) || supply < 0) {
    throw new Error(`Invalid WTAO-4f5363 circulatingSupply: ${rawSupply}`)
  }

  api.addCGToken('bittensor', supply)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is calculated as the circulating supply of Wrapped TAO (WTAO-4f5363) on MultiversX (minted minus burnt), which represents the exact amount of TAO locked on the Bittensor side of the bridge.',
  bittensor: { tvl },
}