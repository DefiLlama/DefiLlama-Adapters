const { get } = require('../helper/http')

const WTAO = 'WTAO-4f5363'

const tvl = async (api) => {
  const { minted, burnt } = await get(`https://api.multiversx.com/tokens/${WTAO}/supply`)
  const supply = Number(BigInt(minted) - BigInt(burnt)) / 1e9
  api.addCGToken('bittensor', supply)
}

module.exports = {
  methodology: 'TVL is the circulating supply of Wrapped TAO (WTAO-4f5363) on MultiversX, which is minted 1:1 against TAO held in the Hatom Bittensor bridge custody.',
  bittensor: { tvl },
}
