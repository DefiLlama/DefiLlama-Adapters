const { get } = require('../helper/http')

async function staking(api) {
  // Total OGY staked in SNS governance neurons, in e8s
  // Ref: https://gateway.origyn.com/docs/#/Tokens/get_origyn_governance_stats
  const { total_staked } = await get('https://gateway.origyn.com/v1/tokens/OGY/governance/stats');

  api.addCGToken('origyn-foundation', Number(total_staked) / 1e8)
}

module.exports = {
  timetravel: false,
  methodology: "Staking counts OGY staked in ORIGYN SNS governance neurons. Certified asset value is tracked as RWA, not TVL.",
  icp: { tvl: () => ({}), staking },
}
