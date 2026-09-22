const { get } = require('../http')
const { sleep } = require('../utils')

// blockchair free tier: ~30 req/min per IP, so requests are sequential with a small pause
const url = addr => 'https://api.blockchair.com/zcash/dashboards/address/' + addr + '?limit=0'

async function getBalance(addr) {
  const { data } = await get(url(addr))
  if (!data?.[addr]?.address) throw new Error('zcash: no balance data for ' + addr)
  return Number(data[addr].address.balance) // zatoshi (8 decimals)
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('zcash', balance / 1e8)
    await sleep(5000)
  }
  return api.getBalances()
}

module.exports = {
  getBalance,
  sumTokens,
}
