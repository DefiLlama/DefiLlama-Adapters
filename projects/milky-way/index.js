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

async function tvl() {
  const { api } = arguments[3]
  const data = await queryContract({ contract: consts.MILKYWAY_CONTRACT, chain: api.chain, data: { state: {} } });
  const batchData = await queryContract({ contract: consts.MILKYWAY_CONTRACT, chain: api.chain, data: { batches: {} } });
  const {batches} = batchData

  //  when calculating TVL, current unbonding batches with TIA should be added since they are 'locked' inside the contract at that current point in time
  const batchTVL = batches.filter(b => b.status !== 'received').reduce((acc, b) => acc + Number(b.expected_native_unstaked), 0)
  api.add('ibc/'+ADDRESSES.ibc.TIA, (Number(data.total_native_token) + batchTVL).toString())
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts the tokens that are locked in the Milky Way contract',
  osmosis: {
    tvl,
  }
} //  node test.js projects/milky-way/index.js