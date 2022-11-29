const sdk = require('@defillama/sdk');
const { staking } = require('../helper/staking')
const { BigNumber } = require('bignumber.js');
const abi = require('./abi.json')

const api3_token = '0x0b38210ea11411557c13457d4da7dc6ea731b88a'
const api3_dao_pool = '0x6dd655f10d4b9e242ae186d9050b68f725c76d76'
const api3CirculatingSupply = "cD34bC5B03C954268d27c9Bc165a623c318bD0a8"

const stakingTVL = async (timestamp, ethBlock, chainBlocks) => {
  const staked = await staking(api3_dao_pool, api3_token)(timestamp, ethBlock, chainBlocks)
  
  const { output: locked_and_vested } = await sdk.api.abi.call({
    target: api3CirculatingSupply,
    abi: abi["getLockedVestings"],
    block: ethBlock,
    chain: 'ethereum'
  });
  console.log(staked, locked_and_vested)
  staked[api3_token] = BigNumber(staked[api3_token]).minus(BigNumber(locked_and_vested)).toFixed(0)
  console.log(staked)

  return staked
}

// TODO: choose if this should be counted as staking or tvl, since this is how the protocol functions (to insure dAPI)
module.exports = {
  ethereum: {
    staking: stakingTVL, // tvl / staking
    // staking: staking(api3_dao_pool, api3_token), // tvl / staking
    tvl: () => ({})
  },
  methodology: 'API3 TVL is all API3 token staked in the API3 DAO Pool contract',
}
