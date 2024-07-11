const MONEY_TOKEN_CONTRACT = '0xB162CaA6b63DE33EDc5D0A14b901FB6A54eE6B8f';
const MONEY_BOND_CONTRACT = '0x08285A9982CcF65eC579220a12D274C9451B57E9'; 
//0x30F75834cB406b7093208Fda7F689938aCBD1EeB <-- Money Markets address

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MONEY_TOKEN_CONTRACT,
    params: [MONEY_BOND_CONTRACT],
  });

  api.add(MONEY_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
  methodology: 'counts the number of Money tokens in the Money Markets contract.',
  start: 1000235,
  ethereum: {
    tvl,
  }
}; 