const { getTokenData } = require('../helper/chain/elrond')
const { nullAddress } = require('../helper/tokenMapping')

module.exports = {
  elrond: { tvl}
}

async function tvl(_, _b, _cb, { api, }) {
  const data = await getTokenData('JWLEGLD-023462')
  api.add(nullAddress, data.minted - data.burnt)
}

