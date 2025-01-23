const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

async function bscTvl(api) {
  const stBTCTokenAddress = ADDRESSES.swellchain.stBTC;
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