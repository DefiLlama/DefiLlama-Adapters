const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const BONFIRE_TOKEN_CONTRACT = '0x5e90253fbae4Dab78aa351f4E6fed08A64AB5590';
const BONFIRE_TOKEN_WRAPPER_CONTRACT = '0xBFbb27219f18d7463dD91BB4721D445244F5d22D';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: BONFIRE_TOKEN_CONTRACT,
    params: [BONFIRE_TOKEN_WRAPPER_CONTRACT],
    block: chainBlocks['bsc'],
  })).output;

  sdk.util.sumSingleBalance(balances, transform(BONFIRE_TOKEN_CONTRACT), collateralBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of Bonfire wrapped in the BonfireTokenWrapper contract',
  start: 20879730,
  bsc: {
    tvl,
  }
};
