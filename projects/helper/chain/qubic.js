const sdk = require('@defillama/sdk')
const { get } = require('../http')

const RPC = 'https://rpc.qubic.org'

async function getBalance(address) {
  const res = await get(`${RPC}/v1/balances/${address}`)
  return +(res?.balance?.balance ?? 0)
}

async function sumTokens({ balances = {}, owners = [] }) {
  for (const owner of owners) {
    const amount = await getBalance(owner)
    sdk.util.sumSingleBalance(balances, 'coingecko:qubic-network', amount)
  }
  return balances
}

module.exports = {
  sumTokens,
  getBalance,
}
