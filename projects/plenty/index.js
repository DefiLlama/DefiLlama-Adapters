const { sumTokens2, } = require('../helper/chain/tezos')
const { getConfig } = require("../helper/cache")

async function tvl() {
  return sumTokens2({ owners: await getDexes(), includeTezos: true, })
}

async function getDexes() {
  const data = await getConfig('tezos/plenty', "https://config.mainnet.plenty.network/pools")
  return Object.keys(data)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: '2023-01-01',
  tezos: {
    tvl,
  },
}