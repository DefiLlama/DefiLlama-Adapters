const sdk = require('@defillama/sdk');
const { transformBscAddress } = require('../helper/portedTokens');
const MINT_TOKEN_CONTRACT = '0x1f3Af095CDa17d63cad238358837321e95FC5915';
const MINT_CLUB_BOND_CONTRACT = '0x8BBac0C7583Cc146244a18863E708bFFbbF19975';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: MINT_TOKEN_CONTRACT,
    params: [MINT_CLUB_BOND_CONTRACT],
    block: chainBlocks['bsc'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(MINT_TOKEN_CONTRACT), collateralBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.'
  start: 1000235,
  bsc: {
    tvl,
  }
}; 
