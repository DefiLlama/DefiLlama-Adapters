const { queryContract } = require('../helper/chain/cosmos')

const STAKING_CONTRACT = 'terra1x44ptyv7zp9e289jxqu6x5asxazhjc8gvuj9ltfs6mzvjfuzn8lqluk4u7'
const TERRAPORT_TOKEN  = 'terra1ex0hjv3wurhj4wgup4jzlzaqj4av6xqd8le4etml7rg9rs207y4s8cdvrp'

async function tvl(api) {
  const res = await queryContract({
    contract: STAKING_CONTRACT,
    chain: 'terra',
    data: { system_info: {} }
  })

  // total_weighted_stake = total staked TERRA tokens (6 decimals)
  if (res.total_weighted_stake && res.total_weighted_stake !== '0') {
    api.addCGToken('terraport', res.total_weighted_stake / 1e6)
  }

  // Add LUNC rewards held in contract
  if (res.current_balances && Array.isArray(res.current_balances)) {
    res.current_balances.forEach(([asset, amount]) => {
      if (!amount || amount === '0') return
      if (asset.asset_type === 'native' && asset.address === 'uluna') {
        api.add('terra:uluna', amount)
      }
    })
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Total tokens staked in the Terraport dynamic staking contract",
  terra: {
    tvl
  }
}
