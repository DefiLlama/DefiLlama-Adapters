const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

const PUSH = '0xf418588522d5dd018b425e472991e52ebbeeeeee'
const PUSH_WETH_LP = '0xaf31fd9c3b0350424bf96e551d2d1264d8466205'
const staking_contract = '0xb72ff1e675117bedeff05a7d0a472c3844cfec85'

module.exports = {
  methodology: `TVL for PUSH consists of the staking of PUSH and pool2 of uni-v2 LP.`, 
  ethereum:{
    tvl: () => ({}),
    staking: staking(staking_contract, PUSH), 
    pool2: pool2(staking_contract, PUSH_WETH_LP), 
  }
}