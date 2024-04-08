const config = {
    blast: {
        weth90dVault: '0x740f2065BFaAEAfC48a0c497B1839b65e32574d5',
        weth90dYieldManager: '0xc932317385fDc794633f612874BD687eA987B151',
        usdb90dVault: '0x48EB093B79Dd924Bf1768E62468a3ab45fdBF1Cb',
        usdb90dYieldManager: '0x57A6CcB2d5663eF874c29b161dD7907c7673feb0',
    },
  }

module.exports = {
    doublecounted: true,
};

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const weth90dPrincipal = await api.multiCall({ abi: 'function principal() external view returns (uint256)', target: config[chain].weth90dYieldManager });
            const weth90dYield = await api.multiCall({ abi: 'function getTotalYield() external view returns (uint256)', target: config[chain].weth90dVault });
            const usdb90dPrincipal = await api.multiCall({ abi: 'function principal() external view returns (uint256)', target: config[chain].usdb90dYieldManager });
            const usdb90dYield = await api.multiCall({ abi: 'function getTotalYield() external view returns (uint256)', target: config[chain].usdb90dVault });
            
            // TODO: need to fetch ETH price
            return (weth90dPrincipal + weth90dYield) * 3600 + (usdb90dPrincipal + usdb90dYield);
        }
    }
})