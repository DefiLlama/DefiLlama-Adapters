const PEPE_TOKEN_CONTRACT = '0x6982508145454Ce325dDbE47a25d4ec3d2311933';
const LOCKED_MONEY_CONTRACT = '0x30F75834cB406b7093208Fda7F689938aCBD1EeB'; //wallet that has all the locked money

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: PEPE_TOKEN_CONTRACT,
    params: [LOCKED_MONEY_CONTRACT],
  });
  

  api.add(PEPE_TOKEN_CONTRACT, collateralBalance);
}

module.exports = {
  methodology: 'Sums the value of deposited memes',
  start: 1000235,
  ethereum: {
    tvl,
  }
}; 