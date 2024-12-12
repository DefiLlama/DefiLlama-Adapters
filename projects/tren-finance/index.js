const POOL_ADDRESS = '0xe9766D6aed0A73255f95ACC1F263156e746B70ba'; 
const TOKEN_A = '0xD4fe6e1e37dfCf35E9EEb54D4cca149d1c10239f'; 
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
