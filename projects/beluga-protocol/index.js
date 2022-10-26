const { sumTokens2, } = require('../helper/solana')
const utils = require('../helper/utils')

async function tvl() {
  const { data: pools } = await utils.fetchURL('https://www.beluga.so/api/poolinfos.json')
  const tokensAndOwners = pools.map(({ owner, tokens}) => tokens.map(i => ([i, owner]))).flat()
  return sumTokens2({ tokensAndOwners })
}

module.exports = {
  timetravel: false, 
  solana: {
    tvl,
  },
  methodology: 'TVL consists of staked tokens',
}
