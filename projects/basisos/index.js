const DATA_PROVIDER_ADDRESS = '0xDD5C8aB2E9F113b397ff2b8528C649bAEf24dF97'

async function tvl(api) {
  // Get all vaults addresses from the data provider contract
  const vaults = await api.call({
    target: DATA_PROVIDER_ADDRESS,
    abi: 'address[]:getAllVaults',
  })

  // Calculate the TVL for each vault and sum them up
  const tvl = await api.erc4626Sum({ calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })

  return tvl
}

  
module.exports = {
  methodology: "TVL is calculated as the aggregated sum of total assets across all deployed vaults.",
  timetravel: true,
  arbitrum: { tvl },
};