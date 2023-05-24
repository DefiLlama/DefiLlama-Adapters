const sdk = require('@defillama/sdk');
const MINT_TOKEN_CONTRACT = '0xb3A95BdBe4AC65B0628db1E6600F71ed59b89255';
const MINT_CLUB_BOND_CONTRACT = '0x64286cDa344BdF0A48a838656B0D0a2d7a5F8EF5';

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MINT_TOKEN_CONTRACT,
    params: [MINT_CLUB_BOND_CONTRACT],
  });

  await sdk.util.sumSingleBalance(balances, MINT_TOKEN_CONTRACT, collateralBalance, api.chain)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of UnityDefi tokens in the Club Bonding contract.',
  start: 100023,
  bsc: {
    tvl,
  }
}; 