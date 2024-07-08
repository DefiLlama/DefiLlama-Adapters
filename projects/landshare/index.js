const LANDSHARE_TOKEN_CONTRACT = '0xA73164DB271931CF952cBaEfF9E8F5817b42fA5C';
const LANDSHARE_STAKING_CONTRACT = '0x3f9458892fB114328Bc675E11e71ff10C847F93b';
const LANDSHARE_LP_TOKEN_CONTRACT = '0x13f80c53b837622e899e1ac0021ed3d1775caefa';

async function tvl(api) {
  // Get the balance of LANDSHARE tokens in the staking contract
  const landshareTokenBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: LANDSHARE_TOKEN_CONTRACT,
    params: [LANDSHARE_STAKING_CONTRACT],
  });

  // Get the balance of LANDSHARE LP tokens in the LP staking contract
  const landshareLpTokenBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: LANDSHARE_LP_TOKEN_CONTRACT,
    params: [LANDSHARE_STAKING_CONTRACT],
  });

  // Add the LANDSHARE token balance to the balances object
  api.add(LANDSHARE_TOKEN_CONTRACT, landshareTokenBalance);

  // Add the LANDSHARE LP token balance to the balances object
  api.add(LANDSHARE_LP_TOKEN_CONTRACT, landshareLpTokenBalance);
}

module.exports = {
  methodology: 'Counts the number of LANDSHARE tokens in the staking contract and LANDSHARE LP tokens in the LP staking contract.',
  start: 26406467, // First block for Landshare token creator
  bsc: {
    tvl,
  },
  timetravel: true,
  misrepresentedTokens: false,
};
