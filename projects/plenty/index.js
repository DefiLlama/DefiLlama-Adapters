const { sumTokens2, } = require('../helper/chain/tezos')
const { get } = require("../helper/http")

async function tvl() {
  return sumTokens2({ owners: await getDexes(), includeTezos: true, })
}

async function getDexes() {
  const data = await get("https://config.mainnet.plenty.network/pools")
  return Object.keys(data)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  start: 1672531200,
  tezos: {
    tvl,
  },
}