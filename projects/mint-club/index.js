const sdk = require('@defillama/sdk')

const MINT_TOKEN_CONTRACT = '0x1f3Af095CDa17d63cad238358837321e95FC5915';
const MINT_CLUB_BOND_CONTRACT = '0x8BBac0C7583Cc146244a18863E708bFFbbF19975';

async function tvl(timestamp, block, chainBlocks) {
  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: MINT_TOKEN_CONTRACT,
    params: [MINT_CLUB_BOND_CONTRACT],
    block: chainBlocks['bsc'],
  })).output;

  return { [MINT_TOKEN_CONTRACT]: collateralBalance };
}

module.exports = {
  bsc: {
    tvl: tvl,
  },
  tvl,
};