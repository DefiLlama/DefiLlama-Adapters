const utils = require('../helper/utils')
const BigNumber = require('bignumber.js')

const url = 'https://www.solfire.finance/api/tvl.json'

async function tvl(){
  const result = await utils.fetchURL(url)
  return {solana: new BigNumber(result.data.tvl)}
}

module.exports = {
  solana: {
    tvl,
  },
  tvl
}
