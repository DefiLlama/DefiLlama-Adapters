const vaults = {
  base: [
    '0x3a43aec53490cb9fa922847385d82fe25d0e9de7',
    '0xbCbc8cb4D1e8ED048a6276a5E94A3e952660BcbC',
    '0x0000000f2eB9f69274678c76222B35eEc7588a65',
    '0x50c749aE210D3977ADC824AE11F3c7fd10c871e9'
  ],
  ethereum: [
    '0x586675A3a46B008d8408933cf42d8ff6c9CC61a1',
  ],
}

async function tvl(api) {
  const vaultAddresses = vaults[api.chain]
  const assets = await api.multiCall({ calls: vaultAddresses, abi: 'address:asset' })
  const totalSupplies = await api.multiCall({ calls: vaultAddresses, abi: 'uint256:totalSupply' })
  const rates = await api.multiCall({
    calls: vaultAddresses.map(v => ({
      target: v,
      params: ['1000000000000000000'],
    })), 
    abi: 'function convertToAssets(uint256) view returns (uint256)',
  })
  
  for (let i = 0; i < assets.length; i++) {
    const balance = BigInt(totalSupplies[i]) * BigInt(rates[i]) / BigInt(1e18)
    api.addToken(assets[i], balance)
  }
}


module.exports = {
  methodology: "We calculate TVL based on the Total Supply of our proxy contracts through which users interact with vault's contracts",
  base: {
    tvl
  },
  ethereum: {
    tvl
  },
};