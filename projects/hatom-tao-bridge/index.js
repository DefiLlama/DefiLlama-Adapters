const { get } = require('../helper/http')

const WTAO = 'WTAO-4f5363'

const tvl = async (api) => {
  const { minted, burnt } = await get(`https://api.multiversx.com/tokens/${WTAO}/supply`)
  const supply = BigInt(minted ?? 0) - BigInt(burnt ?? 0)
  if (supply > 0n) api.addCGToken('bittensor', Number(supply) / 1e9)
}

module.exports = {
  methodology: 'TVL is the circulating supply of Wrapped TAO (WTAO-4f5363) on MultiversX, which is minted 1:1 against TAO held in the Hatom Bittensor bridge custody.',
  bittensor: { tvl },
}
