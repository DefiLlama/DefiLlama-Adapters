const { toUSDTBalances } = require("../helper/balances");
const { get } = require('../helper/http')

async function staking(api) {
  // Get governance staked OGY (in e8s)
  // Ref: https://gateway.origyn.com/docs/#/Tokens/get_origyn_governance_stats
  const { total_staked } = await get('https://gateway.origyn.com/v1/tokens/OGY/governance/stats');

  api.addCGToken('origyn-foundation', Number(total_staked) / 1e8)
}

async function tvl() {
  // Get the total value of ORIGYN Certificates
  // Ref: https://github.com/ORIGYN-SA/origyn-sns/blob/master/backend/canisters/collection_index/impl/src/queries/http_request.rs#L29
  const collectionIndexUrl = 'https://leqqw-uaaaa-aaaaj-azsba-cai.raw.icp0.io/stats';
  const collectionIndexData = await get(collectionIndexUrl);
  const collectionTvl = collectionIndexData.total_value_locked;

  return toUSDTBalances(collectionTvl);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL the total locked value of staked tokens and the total asset value of ORIGYN certificates.",
  icp: { tvl, staking },
}
