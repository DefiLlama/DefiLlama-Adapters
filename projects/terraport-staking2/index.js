const { queryContract } = require('../helper/chain/cosmos')

const STAKING_CONTRACT = 'terra134ummlrj2rnv8h8rjhs6a54fng0xlg8wk7a2gwu6vj42pznkf6xs95966d'
const TERRAPORT_TOKEN  = 'terra1ex0hjv3wurhj4wgup4jzlzaqj4av6xqd8le4etml7rg9rs207y4s8cdvrp'

async function tvl(api) {
  const res = await queryContract({
    contract: STAKING_CONTRACT,
    chain: 'terra',
    data: { total_amount: {} }
  })

  const totalStaked = res.total_staked || res.total_amount || '0'

  // TERRA token has 6 decimals, listed on CoinGecko as 'terraport'
  api.addCGToken('terraport', totalStaked / 1e6)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Total TERRA tokens locked in Terraport classic staking contract",
  terra: {
    tvl
  }
}
