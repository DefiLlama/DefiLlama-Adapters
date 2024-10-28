const sdk = require('@defillama/sdk');

async function bscTvl(api) {
  const stBTCTokenAddress = '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3';
  const totalSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: stBTCTokenAddress,
  });

  const balances = {};
  sdk.util.sumSingleBalance(balances, 'coingecko:bitcoin', totalSupply / (1e18));
  return balances;
}

module.exports = {
  methodology: "Lorenzo, As the Bitcoin Liquidity Finance Layer",
  bsc: {
      tvl: bscTvl,
  }
};