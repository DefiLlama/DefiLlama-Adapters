const { get } = require('../http')
const plimit = require('p-limit')
const { sleep } = require('../utils')
const { getEnv } = require('../env')

// const CRYPTOAPIS_API_KEY = getEnv('CRYPTOAPIS_API_KEY');
// const url = addr => 'https://api.blockcypher.com/v1/doge/main/addrs/' + addr + '/balance'
// const _rateLimited = plimit(1)
// const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
// const getBalance = rateLimited(_getBalance)

// async function _getBalance(addr) {
//   await sleep(3000)
//   try {
//     const { final_balance } = await get(url(addr))
//     return Number(final_balance)
//   } catch (e) {
//     if (CRYPTOAPIS_API_KEY) {
//       const cryptoapisUrl = `https://rest.cryptoapis.io/addresses-latest/utxo/dogecoin/mainnet/${addr}/balance`;
//       const response = await get(cryptoapisUrl, { headers: { 'x-api-key': CRYPTOAPIS_API_KEY } });
//       return Number(response.data.item.confirmedBalance.amount);
//     }
//     throw e;
//   }
// }

// async function sumTokens({ api, owners = [] }) {
//   for (const owner of owners) {
//     const balance = await getBalance(owner)
//     api.addCGToken('dogecoin', balance / 1e8)
//   }
// }

// module.exports = {
//   sumTokens
// }

const url = addr => 'https://api.tatum.io/v3/dogecoin/address/balance/' + addr
const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const getBalance = rateLimited(_getBalance)

async function _getBalance(addr) {
  await sleep(2000)
  const { incoming, outgoing } = await get(url(addr), {
    headers: {
      'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
      'x-api-key': getEnv('TATUM_API_KEY'),
    }
  })
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
