const sdk = require('@defillama/sdk')
const { get } = require('../http')
const plimit = require('p-limit')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

// const url = addr => 'https://doge1.trezor.io/api/v2/address/' + addr
const url = addr => 'https://api.tatum.io/v3/dogecoin/address/balance/' + addr
const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const getBalance = rateLimited(_getBalance)

async function _getBalance(addr) {
  const { incoming, outgoing } = await get(url(addr), {
    headers: {
      'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
      'x-api-key': getEnv('TATUM_PUBLIC_API_KEY'),
    }
  })
  await sleep(2000)
  // return +balance
  return (Number(incoming) - Number(outgoing)) * 1e8 // 8 decimals
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('dogecoin', balance / 1e8)
  }
}

module.exports = {
  sumTokens
}