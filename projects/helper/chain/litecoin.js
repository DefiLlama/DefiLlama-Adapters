const sdk = require('@defillama/sdk')
const { get } = require('../http')

// const url = addr => 'https://chainz.cryptoid.info/ltc/api.dws?q=getbalance&a=' + addr
const url = addr => 'https://ltc.tokenview.io/api/address/balancetrend/ltc/' + addr

async function getBalance(addr) {
  // return get(url(addr))
  const {data} = await get(url(addr))
  return +Object.values(data[0])[0]
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners) {
    const balance = await getBalance(owner)
    total += balance
  }
  sdk.util.sumSingleBalance(balances, 'litecoin', total)
  return balances
}

module.exports = {
  sumTokens
}