const { get } = require('../http')
const plimit = require('p-limit')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

const publicUrl = addr => 'https://api.blockcypher.com/v1/doge/main/addrs/' + addr + '/balance'
const url = addr => 'https://api.tatum.io/v3/dogecoin/address/balance/' + addr
const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const getBalance = rateLimited(_getBalance)

async function _getBalance(addr) {
  await sleep(2000)
  try {
    const { final_balance } = await get(publicUrl(addr))
    return Number(final_balance)
  } catch (e) {
    const { incoming, outgoing } = await get(url(addr), {
      headers: {
        'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
        'x-api-key': getEnv('TATUM_API_KEY'),
      }
    })
    return (Number(incoming) - Number(outgoing)) * 1e8 // 8 decimals
  }
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
