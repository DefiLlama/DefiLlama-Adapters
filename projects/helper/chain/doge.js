const sdk = require('@defillama/sdk')
const { get } = require('../http')
const plimit = require('p-limit')
const { sleep } = require('../utils')

const url = addr => 'https://api.blockcypher.com/v1/doge/main/addrs/' + addr + '/balance'
const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const getBalance = rateLimited(_getBalance)

async function _getBalance(addr) {
  const { final_balance } = await get(url(addr))
  await sleep(2000)
  return Number(final_balance)
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