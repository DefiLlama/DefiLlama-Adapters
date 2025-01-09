const sdk = require('@defillama/sdk')
const { get } = require('../http')


async function getBalance(key) {
  const data = await get(`https://explorer.aelf.io/api/viewer/balances?address=${key}`)
  return +(data?.data?.[0]?.balance ?? 0)
}

async function sumTokens({ balances = {}, owners = [] }) {
  let total = 0
  for (const owner of owners) {
    const balance = await getBalance(owner)
    total += balance
  }
  sdk.util.sumSingleBalance(balances, 'aelf', total)
  return balances
}

module.exports = {
  sumTokens
}