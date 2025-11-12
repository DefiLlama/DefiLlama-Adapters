const { queryContract } = require("../helper/chain/cosmos");
const ADDRESSES = require('../helper/coreAssets.json')

const consts = {
  MILKTIA_CONTRACT: 'osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0',
  MILKBABY_CONTRACT: 'milk1qg5ega6dykkxc307y25pecuufrjkxkaggkkxh7nad0vhyhtuhw3ssgcye4',
  MILKINIT_CONTRACT: 'init17p9rzwnnfxcjp32un9ug7yhhzgtkhvl9jfksztgw5uh69wac2pgsj6uxxj',
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

async function milkTIATVL(api) {
  const data = await queryContract({ contract: consts.MILKTIA_CONTRACT, chain: api.chain, data: { state: {} } });
  const  {batches} = await queryContract({ contract: consts.MILKTIA_CONTRACT, chain: api.chain, data: { batches: {} } });
  const token = 'ibc/'+ADDRESSES.ibc.TIA

  //  when calculating TVL, current unbonding batches with TIA should be added since they are 'locked' inside the contract at that current point in time
  batches.filter(b => b.status !== 'received').forEach((b) => api.add(token, b.expected_native_unstaked))
  api.add(token, data.total_native_token)
  return api.getBalances()
}

async function milkBabyTVL(api) {
  const data = await queryContract({ contract: consts.MILKBABY_CONTRACT, chain: api.chain, data: { state: {} } });
  const {batches} = await queryContract({ contract: consts.MILKBABY_CONTRACT, chain: api.chain, data: { batches: {} } });
  const token = 'ibc/'+ADDRESSES.ibc.BABY

  //  when calculating TVL, current unbonding batches with TIA should be added since they are 'locked' inside the contract at that current point in time
  batches.filter(b => b.status !== 'received').forEach((b) => api.add(token, b.expected_native_unstaked))
  api.add(token, data.total_native_token)
}

async function milkINITTVL(api) {
  const data = await queryContract({ contract: consts.MILKINIT_CONTRACT, chain: api.chain, data: { state: {} } });
  const {batches} = await queryContract({ contract: consts.MILKINIT_CONTRACT, chain: api.chain, data: { batches: {} } });
  const token = 'ibc/'+ADDRESSES.ibc.INIT

  //  when calculating TVL, current unbonding batches with TIA should be added since they are 'locked' inside the contract at that current point in time
  batches.filter(b => b.status !== 'received').forEach((b) => api.add(token, b.expected_native_unstaked))
  api.add(token, data.total_native_token)
}

module.exports = {
  methodology: 'TVL counts the tokens that are locked in the Milky Way liquid staking protocol',
  osmosis: {
    tvl: milkTIATVL,
  },
  milkyway: {
    tvl: milkBabyTVL,
  },
  'milkyway_rollup': {
    tvl: milkINITTVL,
  }
} //  node test.js projects/milky-way/index.js