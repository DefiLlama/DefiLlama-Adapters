const SUSD1PLUS_TOKEN_CONTRACT_ADDRESS_BSC = "0x4F2760B32720F013E900DC92F65480137391199b";

/**
 * Calculate TVL for Lorenzo sUSD1+ on BSC
 * @param {import('@defillama/sdk').ChainApi} api - DefiLlama Chain API instance
 * @returns {Promise<Object>} Balances object with TVL data
 */
/** TODO: The following implementation assumes sUSD1+ is a USD-pegged stablecoin vault. 
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
*/

/**
  * Simplified TVL calculation assuming sUSD1+ is a USD-pegged stablecoin vault.
  * This implementation just uses the total supply as TVL.
  * @param {import('@defillama/sdk').ChainApi} api - DefiLlama Chain API instance
  * @returns {Promise<void>}
  */
async function bscTvl(api) {
  api.add(SUSD1PLUS_TOKEN_CONTRACT_ADDRESS_BSC, await api.call({
    abi: 'erc20:totalSupply',
    target: SUSD1PLUS_TOKEN_CONTRACT_ADDRESS_BSC,
  }));
}

module.exports = {
  methodology: "Lorenzo sUSD1+ is a vault that represents tokenized real-world assets.  The protocol maintains a Net Asset Value (NAV) that reflects the current value of the underlying asset portfolio per token. For simplified calculation, the current implementation uses total supply as TVL, assuming the vault maintains close to $1 NAV per token through its underlying asset management strategy.",
  bsc: {
    tvl: bscTvl,
  }
};
