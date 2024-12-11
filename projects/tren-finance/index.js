const POOL_ADDRESS = '0x3F2014E364242Eab1Baf6495B89DF14Ce29D040d'; 
const TOKEN_A = '0x1B4267685C2E1d684b4A95ABe240f2938ee02D7e'; 
const TOKEN_B = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'; 

async function tvl(api) {
  const tokenABalance = await api.call({
    abi: 'erc20:balanceOf',
    target: TOKEN_A,
    params: [POOL_ADDRESS],
  });


  const tokenBBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: TOKEN_B,
    params: [POOL_ADDRESS],
  });


  api.add(TOKEN_A, tokenABalance);
  api.add(TOKEN_B, tokenBBalance);
}

module.exports = {
  methodology: 'Counts the balances of the tokens in the liquidity pool on Uniswap',
  start: 1680000000, 
  arbitrum: {
    tvl,
  },
};
