async function tvl(api) {
    const tvl = await api.call({ target: '0xf44e393dd0796aBC4426B290C5464Cb8cb0cAaB1', abi: 'uint256:getTotalTvl'});
    const asset = await api.call({ target: '0xf44e393dd0796aBC4426B290C5464Cb8cb0cAaB1', abi: 'address:asset'});
    const assetDecimals = await api.call({ target: asset, abi: 'uint8:decimals'});
  
    return {
      'usd-coin': tvl / 10 ** assetDecimals
    }
  }
  
    
  module.exports = {
    methodology: "TVL is calculated as the aggregated sum of total assets across all deployed vaults.",
    timetravel: false,
    arbitrum: { tvl },
  };