const {staking} = require('../helper/staking')

const NICKEL = '0xe11b4DD87675B52980b3427029a2d792A4A05aa2'
const GRID_MINING = '0xEF35314a4F3a1F8CE89095202dABAeEe1CaAd760'
const STAKING = '0x93CF815EC397C526576078A74197c3fa2d769b80'

module.exports = {
  methodology: 'TVL is NICKEL tokens held in GridMining (mined rewards) and Staking (user-staked NICKEL).',
  base: { 
    tvl: () => ({}),
    staking: staking([STAKING, GRID_MINING], NICKEL),
    },
}