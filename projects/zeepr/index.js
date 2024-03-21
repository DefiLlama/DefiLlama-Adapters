const MINT_TOKEN_CONTRACT = '0x1c2D10633C78A47786759715d4618296D85D7cD1';
const MINT_CLUB_BOND_CONTRACT = '0xd6eE9E6be560D8AEd6Caf1bAcF58603fA4b7e475';

async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: 'address:totalMargins',
    target: MINT_TOKEN_CONTRACT,
    params: [MINT_CLUB_BOND_CONTRACT],
  });

  api.add(MINT_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the number of margin in the contract address.',
  start: 1679391877,
  arbitrum: {
    tvl,
  }
}; 
