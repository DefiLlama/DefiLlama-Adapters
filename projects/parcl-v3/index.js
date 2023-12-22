const { sumTokens2, } = require('../helper/solana')

async function tvl() {
  // https://docs.parcl.co/addresses
  return sumTokens2({ tokenAccounts: ['Ai9AuTfGncuFxEknjZT4HU21Rkv98M1QyXpbW9Xct6LK'] })
}

module.exports = {
  timetravel: false,
  solana: { tvl, },
}