const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

async function tvl(api) {
  const rUSDCTokenAddress = ADDRESSES.swellchain.rUSDC;
  const totalSupply = await api.call({
      abi: 'erc20:totalSupply',
      target: rUSDCTokenAddress,
  });

  const balances = {};
  sdk.util.sumSingleBalance(balances, 'coingecko:usd-coin', totalSupply / (1e6));
  return balances;
}

module.exports = {
  methodology: "rUSDC minted on the Swellchain",
  swellchain: {
      tvl: tvl,
  }
};