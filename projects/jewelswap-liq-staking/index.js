const { getTokenData, sumTokens, } = require('../helper/chain/elrond')
const { nullAddress } = require('../helper/tokenMapping')

module.exports = {
  elrond: { tvl}
}

async function tvl(api) {
  const data = await getTokenData('JWLEGLD-023462')
  const data2 = await getTokenData('JWLASH-f362b9')
  api.add(nullAddress, data.minted - data.burnt)
  api.add('JWLASH-f362b9', data2.minted - data2.burnt)
}

