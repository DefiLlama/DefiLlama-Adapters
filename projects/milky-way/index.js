const { queryContract } = require("../helper/chain/cosmos");
const ADDRESSES = require('../helper/coreAssets.json')

const consts = {
  MILKYWAY_CONTRACT: 'osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0',
}

/**
 *  {
 *       id: 1,
 *       batch_total_liquid_stake: '100000',
 *       expected_native_unstaked: '100000',
 *       received_native_unstaked: '100000',
 *       unstake_request_count: 1,
 *       next_batch_action_time: '0',
 *       status: 'received'
 *     }
 */

async function tvl(api) {
  const data = await queryContract({ contract: consts.MILKYWAY_CONTRACT, chain: api.chain, data: { state: {} } });
  const  {batches} = await queryContract({ contract: consts.MILKYWAY_CONTRACT, chain: api.chain, data: { batches: {} } });
  const token = 'ibc/'+ADDRESSES.ibc.TIA
  //  when calculating TVL, current unbonding batches with TIA should be added since they are 'locked' inside the contract at that current point in time
  batches.filter(b => b.status !== 'received').forEach((b) => api.add(token, b.expected_native_unstaked))
  api.add(token, data.total_native_token)
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL counts the tokens that are locked in the Milky Way contract',
  osmosis: {
    tvl,
  }
} //  node test.js projects/milky-way/index.js