const { sumTokens2, } = require('../helper/chain/tezos')
const { getConfig } = require("../helper/cache")

const API_URL = 'https://config.mainnet.plenty.network/pools'

const tvl = async () => {
  const data = await getConfig('tezos/plenty', API_URL)
  return sumTokens2({ owners: Object.keys(data), includeTezos: true, })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: '2023-01-01',
  tezos: { tvl },
}