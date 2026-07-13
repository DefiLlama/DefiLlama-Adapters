const { get } = require('../helper/http')

async function tvl() {
  const { result } = await get('https://api-chain.axiomechain.org/validators?per_page=200')
  const bonded = result.validators.reduce(
    (sum, v) => sum + Number(v.voting_power), 0
  )
  return {
    'axiome': bonded, 
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL equals total staked AXM across all validators, queried from the chain RPC.',
  axiome: { tvl },
}
