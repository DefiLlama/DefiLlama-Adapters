const { sumTokens2, } = require('./helper/solana')

async function tvl() {
  return sumTokens2({ owner: '3uTzTX5GBSfbW7eM9R9k95H7Txe32Qw3Z25MtyD2dzwC', })
 
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  hallmarks: [
    ['2022-10-11', "Mango Markets Hack"],
    ['2022-11-08', "FTX collapse"]
  ],
}