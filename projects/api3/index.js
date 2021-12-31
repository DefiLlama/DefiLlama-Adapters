const { staking } = require('../helper/staking')

const api3_token = '0x0b38210ea11411557c13457d4da7dc6ea731b88a'
const api3_dao_pool = '0x6dd655f10d4b9e242ae186d9050b68f725c76d76'

// TODO: choose if this should be counted as staking or tvl, since this is how the protocol functions (to insure dAPI)
module.exports = {
  ethereum: {
    staking: staking(api3_dao_pool, api3_token), // tvl / staking
    tvl: () => ({})
  },
  methodology: 'API3 TVL is all API3 token staked in the API3 DAO Pool contract',
}
