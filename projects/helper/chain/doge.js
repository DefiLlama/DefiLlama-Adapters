const sdk = require('@defillama/sdk')
const { get } = require('../http')
const plimit = require('p-limit')
const { sleep } = require('../utils')

const url = addr => 'https://doge1.trezor.io/api/v2/address/' + addr
const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const getBalance = rateLimited(_getBalance)

async function _getBalance(addr) {
  const { balance } = await get(url(addr), {
    headers: {
      'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
    }
  })
  await sleep(2000)
  return +balance
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