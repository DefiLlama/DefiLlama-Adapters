/**
 * Kernel DAO contracts
 * 
 * @see https://github.com/Kelp-DAO/kernel-smart-contracts-private/blob/develop/doc/contract-address/Mainnet.md
 */
const ASSET_REGISTRY = '0xd0B91Fc0a323bbb726faAF8867CdB1cA98c44ABB';


/**
 * Get KernelDAO managed assets
 */
async function getAssets(api) {
  return await api.call({
    abi: 'function getAssets() external view returns (address[] memory)',
    target: ASSET_REGISTRY,
    params: [],
  });
}

/**
 * Calculate TVL
 */
async function tvl(api) {
  // KernelDAO managed assets
  const assets = await getAssets(api);

  // iterate on KernelDAO managed assets
  for (const asset of assets) {
    // get Vault's balance
    const balance = await api.call({
      abi: 'function getVaultBalance(address asset) external view returns (uint256)',
      target: ASSET_REGISTRY,
      params: [asset],
    });

    // add balance to TVL
    api.add(asset, balance);
  };
}

module.exports = {
  methodology: 'Calculates total TVL.',
  start: 1733817000,
  bsc: {
    tvl,
  }
};
