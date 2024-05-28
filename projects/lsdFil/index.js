const ADDRESSES = require('../helper/coreAssets.json')
const MINT_TOKEN_CONTRACT = ADDRESSES.filecoin.WFIL;
const MINT_CLUB_BOND_CONTRACT = '0x7187b3B1314375909B775d72fB7214Cb71a7D907';


async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MINT_TOKEN_CONTRACT,
    params: [MINT_CLUB_BOND_CONTRACT],
  });

  api.add(MINT_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
      methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  filecoin: {
    tvl,
  }
}; 