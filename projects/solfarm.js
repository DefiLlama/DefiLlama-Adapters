const { sumTokens2 } = require('./helper/solana')

async function tvl() {
  return sumTokens2({ owner: '8gEGZbUfVE1poBq71VHKX9LU7ca4x8wTUyZgcbyQe51s'})
}

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
],
  timetravel: false,
  solana: { tvl }
}
