const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ tokenAccounts: ['Ai9AuTfGncuFxEknjZT4HU21Rkv98M1QyXpbW9Xct6LK'] })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}