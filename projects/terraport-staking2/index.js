const { queryContract } = require('../helper/chain/cosmos')

const STAKING_V2 = 'terra134ummlrj2rnv8h8rjhs6a54fng0xlg8wk7a2gwu6vj42pznkf6xs95966d'
const STAKING_V3 = 'terra1mwqge0lvdzjlvw37v5du75cyrcr22frl4yxul82rcd9acuas08tqu6spjd'
const TERRAPORT_TOKEN = 'terra1ex0hjv3wurhj4wgup4jzlzaqj4av6xqd8le4etml7rg9rs207y4s8cdvrp'

async function tvl(api) {
  const [resV2, resV3] = await Promise.all([
    queryContract({ contract: STAKING_V2, chain: 'terra', data: { total_amount: {} } }),
    queryContract({ contract: STAKING_V3, chain: 'terra', data: { total_amount: {} } }),
  ])

  const v2Staked = BigInt(resV2.total_staked || resV2.total_amount || '0')
  const v3Staked = BigInt(resV3.total_staked || resV3.total_amount || '0')
  const totalStaked = (v2Staked + v3Staked).toString()

  api.addCGToken('terraport', Number(totalStaked) / 1e6)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Total TERRA tokens staked in Terraport classic staking contracts (V2 + V3)",
  terra: {
    tvl
  }
}
