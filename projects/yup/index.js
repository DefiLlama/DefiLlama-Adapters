const sdk = require('@defillama/sdk');
const { transformPolygonAddress } = require('../helper/portedTokens');
const TOKEN_CONTRACT = '0x69bbc3f8787d573f1bbdd0a5f40c7ba0aee9bcc9';
//const MINT_CLUB_BOND_CONTRACT = '0x8BBac0C7583Cc146244a18863E708bFFbbF19975';

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'polygon',
    target: TOKEN_CONTRACT,
    //params: [MINT_CLUB_BOND_CONTRACT],
    block: chainBlocks['polygon'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(TOKEN_CONTRACT), collateralBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: ''
  start: 1000235,
  bsc: {
    tvl,
  }
}; 
