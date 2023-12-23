const { queryContract } = require("../helper/chain/cosmos");
const ADDRESSES = require('../helper/coreAssets.json')

//  using this lcd due to these differences at time of writing
//  https://osmosis-api.polkachu.com/cosmwasm/wasm/v1/contract/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/smart/eyJzdGF0ZSI6e319
//  ^ is currently returning `codespace undefined code 111222: panic`
//  https://lcd.osmosis.zone/cosmwasm/wasm/v1/contract/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/smart/eyJzdGF0ZSI6e319

const consts = {
  MILKYWAY_CONTRACT: 'osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0',
  base64: {
    //  {"state":{}}
    state: 'eyJzdGF0ZSI6e319',
    //  {"config":{}}
    config: 'eyJjb25maWciOnt9fQo='
  }
}

/**
 * State interface
 * "data": {
   * "total_native_token": "295230977551",
   * "total_liquid_stake_token": "294212040567",
   * "rate": "0.996548678622913198",
   * "pending_owner": "",
   * "total_reward_amount": "428203521"
 * }
 */

/**
 * Config interface
 * {
 * "data": {
   * "native_token_denom": "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
   * "liquid_stake_token_denom": "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
   * "treasury_address": "osmo1zmptm0xcrrhmje5tgrppjktkskcnnmkr6v5h3t",
   * "monitors": [
     * "osmo1q3592l37ju7ae9g5yqj90wg2txkwhwvkhl9msd"
   * ],
   * "validators": [
     * "celestiavaloper1murrqgqahxevedty0nzqrn5hj434fvffxufxcl",
     * "celestiavaloper1rcm7tth05klgkqpucdhm5hexnk49dfda3l3hak",
     * "celestiavaloper15urq2dtp9qce4fyc85m6upwm9xul3049gwdz0x",
     * "celestiavaloper1uqj5ul7jtpskk9ste9mfv6jvh0y3w34vtpz3gw",
     * "celestiavaloper1vje2he3pcq3w5udyvla7zm9qd5yes6hzffsjxj",
     * "celestiavaloper1eualhqh07w7p45g45hvrjagkcxsfnflzdw5jzg",
     * "celestiavaloper1uwmf03ke52vld2sa9khs0nslpgzwsm5xs5e4pn",
     * "celestiavaloper1e2p4u5vqwgum7pm9vhp0yjvl58gvhfc6yfatw4",
     * "celestiavaloper1ftmw4wh8dq2ljw0xq3xgg00dl7l20se3lrml7q",
     * "celestiavaloper138jl42zlxue4wpvnugcdqhxjmyd2vpt6qhs5ls",
     * "celestiavaloper1xqc7w3pe38kg4tswjt7mnvks7gy4p38vtsuycj",
     * "celestiavaloper1ac4mnwg79gyvd0x5trl2fgjv07lgfas02jf378"
   * ],
   * "batch_period": 259200,
   * "unbonding_period": 1814400,
   * "minimum_liquid_stake_amount": "100000",
   * "staker_address": "celestia1vxzram63f7mvseufc83fs0gnt5383lvrle3qpt",
   * "reward_collector_address": "celestia1vr00egrck8a0dax68fgglrm3n8v4yz9wjj7cj2",
   * "protocol_fee_config": {
     * "dao_treasury_fee": "10000"
   * },
   * "ibc_channel_id": "channel-6994",
   * "stopped": false
 * }
 * }
 */

async function tvl() {
  const { api } = arguments[3]
  const data = await queryContract({ contract: consts.MILKYWAY_CONTRACT, chain: api.chain, data: { state: {} } });
  api.add('ibc/'+ADDRESSES.ibc.TIA, data.total_native_token)
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts the tokens that are locked in the Milky Way contract',
  osmosis: {
    tvl,
  }
} // node test.js projects/milky-way/index.js