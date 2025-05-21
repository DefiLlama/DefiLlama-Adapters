const { get } = require('../helper/http')

// https://explorer.stacks.co/txid/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault?chain=mainnet
// https://stacks-node-api.blockstack.org/extended/v1/address/SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.alex-vault/balances
const ALEX_API = "https://api.alexlab.co/v1";

async function staking() {
  const url = `${ALEX_API}/stats/tvl`;
  const alexResponse = await get(url)
  return { tether: alexResponse.reserve_pool_value };
}
const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("alexlab", ['stacks']),
}

module.exports.stacks.staking = staking
