const contracts = require("./contracts");

function tvl(chain) {
  return async (timestamp, block, chainBlocks, { api }) => {
    return await Promise.all(
      Object.values(contracts[chain].lvTokens).map(async ({ poolAddress, wantToken }) => {
        const lvTokenTotalAssets = await api.call({ target: poolAddress, abi:  'function totalAssets() view returns (uint256)' })
        const vaultDecimals = await api.call({ target: poolAddress, abi: 'erc20:decimals' });
        const usdPrice = 1800// CoinGecko endpoint
        api.add(poolAddress, lvTokenTotalAssets * usdPrice / vaultDecimals)
      })

    );
  };
  }

module.exports = {
  timetravel: false,
  doublecounted: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl("ethereum"),
  },
  arbitrum: {
    tvl: tvl("arbitrum"),
  }
};
