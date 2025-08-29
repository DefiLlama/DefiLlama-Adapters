const ADDRESSES = require('../helper/coreAssets.json');

const SUSD1PLUS_TOKEN_CONTRACT_ADDRESS_BSC = "0x4F2760B32720F013E900DC92F65480137391199b";

/**
 * Calculate TVL for Lorenzo sUSD1+ on BSC
 * @param {import('@defillama/sdk').ChainApi} api - DefiLlama Chain API instance
 * @returns {Promise<Object>} Balances object with TVL data
 */
async function bscTvl(api) {
  // Get total supply of sUSD1+ tokens
  const totalSupply = await api.call({
    abi: 'erc20:totalSupply',
    target: SUSD1PLUS_TOKEN_CONTRACT_ADDRESS_BSC,
  });

  // Get current unit NAV (Net Asset Value)
  const currentUnitNav = await api.call({
    abi: 'function getCurrentUnitNav() external view returns (uint256)',
    target: SUSD1PLUS_TOKEN_CONTRACT_ADDRESS_BSC,
  });

  // Calculate TVL = totalSupply * currentUnitNav
  // Both values are in wei (18 decimals), so we need to divide by 1e18 once
  const tvlInWei = BigInt(totalSupply) * BigInt(currentUnitNav) / BigInt(1e18);

  // Add as USD1 since sUSD1+ is a USD-pegged stablecoin vault
  api.add(ADDRESSES.bsc.USD1, tvlInWei.toString());
}

module.exports = {
  methodology: "Lorenzo sUSD1+ TVL is calculated by multiplying the total supply of sUSD1+ tokens by their current unit NAV (Net Asset Value).",
  bsc: {
    tvl: bscTvl,
  }
};
