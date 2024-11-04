const { getCache } = require('../helper/http')
const url = 'https://realms-tvl.vercel.app/tvl/latest'

async function tvl() {
  const {totalValueUsd} = await getCache(url)
  return {usd:  parseFloat(totalValueUsd)}
}

module.exports = {
  methodology: 'SOL, SPL tokens and stables held in the contracts are counted under tvl', 
  timetravel: false,
  solana: { tvl }
}
