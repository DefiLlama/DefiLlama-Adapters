const axios = require('axios')
const { DEFAULT_TIMEOUT } = require('../http')

// Casper mainnet json-rpc; owners are account public keys (01... ed25519 / 02... secp256k1)
const RPC = 'https://node.mainnet.casper.network/rpc'
const MOTES_PER_CSPR = 1e9

// liquid CSPR in the account's main purse (motes); delegated/staked CSPR is not included
async function getBalance(owner) {
  const { data } = await axios.post(RPC, {
    jsonrpc: '2.0', id: 1, method: 'query_balance',
    params: { purse_identifier: { main_purse_under_public_key: owner } },
  }, { timeout: DEFAULT_TIMEOUT })
  if (data.error) throw new Error(`casper query_balance failed for ${owner}: ${JSON.stringify(data.error)}`)
  return Number(data.result.balance) / MOTES_PER_CSPR
}

async function sumTokens({ owners = [], api }) {
  for (const owner of owners)
    api.addCGToken('casper-network', await getBalance(owner))
  return api.getBalances()
}

module.exports = {
  getBalance,
  sumTokens,
}
