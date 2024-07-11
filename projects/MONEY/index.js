const MONEY_TOKEN_CONTRACT = '0xb162caa6b63de33edc5d0a14b901fb6a54ee6b8f';
const MONEY_BOND_CONTRACT = '0x08285A9982CcF65eC579220a12D274C9451B57E9'; 

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MONEY_TOKEN_CONTRACT,
    params: [MONEY_BOND_CONTRACT],
  });

  api.add(MONEY_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  methodology: 'counts the number of Money tokens in the IMF_TOKEN_CONTRACT .',
  start: 1000235,
  ethereum: {
    tvl,
  }
}; 