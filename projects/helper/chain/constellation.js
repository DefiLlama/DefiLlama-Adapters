const sdk = require('@defillama/sdk')
const { get } = require('../http')

const BLOCK_EXPLORER = 'https://be-mainnet.constellationnetwork.io'
const DAG_DECIMALS = 8

async function getBalance(address) {
  const res = await get(`${BLOCK_EXPLORER}/addresses/${address}/balance`)
  return +(res?.data?.balance ?? 0) / 10 ** DAG_DECIMALS
}

async function sumTokens({ balances = {}, owners = [] }) {
  for (const owner of owners) {
    const amount = await getBalance(owner)
    sdk.util.sumSingleBalance(balances, 'coingecko:constellation-labs', amount)
  }
  return balances
}

module.exports = {
  sumTokens,
  getBalance,
}
