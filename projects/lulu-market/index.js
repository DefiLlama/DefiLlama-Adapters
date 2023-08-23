const MINT_TOKEN_CONTRACT = '0x80F2C1E25391bbe615EF1F5cE82297fb0A624cb7';
const MINT_CLUB_BOND_CONTRACT = '0xDc090C1403be5ca249e317bcD0c41366bA029Db9';

async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MINT_TOKEN_CONTRACT,
    params: [MINT_CLUB_BOND_CONTRACT],
  });

  api.add(MINT_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of LUCK tokens in the LP.',
  start: 1000235,
  bsc: {
    tvl,
  }
}; 