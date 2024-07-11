const IMF_TOKEN_CONTRACT = '0x05BE1d4c307C19450A6Fd7cE7307cE72a3829A60';
const IMF_BOND_CONTRACT = '0x2625Bfb6aD9840C2c0ABb48f150Eb9158393c466'; //address of the largest holder of IMF

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: IMF_TOKEN_CONTRACT,
    params: [IMF_BOND_CONTRACT],
  });

  api.add(IMF_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  methodology: 'counts the number of IMF tokens in the Club Bonding contract.',
  start: 1000235,
  ethereum: {
    tvl,
  }
}; 