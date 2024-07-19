const { staking } = require('../helper/staking')

// DAO from Coinflex utility token FLEX
// https://coinflex.com/support/2-2-9-flexdao

const FLEX = '0x98Dd7eC28FB43b3C4c770AE532417015fa939Dd3'
const veFLEX = '0xA9bB3b5334347F9a56bebb3f590E8dF97fC091f9'
const coingeckoId = 'flex-coin'
const chain = 'smartbch'
const decimals = 18

module.exports = {
      methodology: 'Counting all FLEX tokens staked in the DAO',
  start: 2153800,
  [chain]: {
    tvl: ()=>({}),
    staking: staking(veFLEX, FLEX, chain, coingeckoId, decimals)
  },
};
