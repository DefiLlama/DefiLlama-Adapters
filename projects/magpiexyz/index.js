const sdk = require('@defillama/sdk');
const { POOL_LIST } = require("./pool")
const MasterMagpieAddress =  "0xa3B615667CBd33cfc69843Bf11Fbb2A1D926BD46";
async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  for(let i = 0, l = POOL_LIST.length; i < l; i++) {
    const pool = POOL_LIST[i];
    const collateralBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: 'bsc',
        target: pool.rawStakingToken,
        params: [MasterMagpieAddress],
        block: chainBlocks['bsc'],
      })).output;
      await sdk.util.sumSingleBalance(balances, `bsc:${[pool.stakingToken]}`, collateralBalance)
  }
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',

  bsc: {
    tvl,
  }
}; 