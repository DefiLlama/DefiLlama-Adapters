const { get } = require('../http')
const { sleep } = require('../utils')

// FIL balance of f1/f3/f4 (or 0x) addresses from the Filfox explorer api, in attoFIL
async function getBalance(address) {
  const { balance } = await get(`https://filfox.info/api/v1/address/${address}`)
  return balance ?? '0' // an address never seen on chain comes back as `{ address }` only
}

async function sumTokens({ api, owners = [] }) {
  for (const owner of owners) {
    const balance = await getBalance(owner)
    api.addCGToken('filecoin', Number(balance) / 1e18)
    await sleep(300)
  }
}

module.exports = {
  getBalance,
  sumTokens,
}
