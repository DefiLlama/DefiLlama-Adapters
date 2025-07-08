const config = {
    ethereum: {},
    arbitrum: {},
    avax: {},
    polygon_zkevm: {
        tokenVault: '0x0896AC8B9e2DC3545392ff65061E5a8a3eD68824',
        currencyController: '0x9E1254292195F241FA2DF1aA51af23796627A74B',
    },
    filecoin: {}
};

Object.keys(config).forEach(chain => {
    const {
        tokenVault = '0xB74749b2213916b1dA3b869E41c7c57f1db69393',
        currencyController = '0x7dca6b6BF30cd28ADe83e86e21e82e3F852bF2DC',
    } = config[chain];
    module.exports[chain] = {
        tvl: async (api) => {
            const bytes = await api.call({
                abi: 'function getCurrencies() view returns (bytes32[])',
                target: currencyController,
            });
            const tokens = await api.multiCall({
                abi: 'function getTokenAddress(bytes32) view returns (address)',
                calls: bytes,
                target: tokenVault,
            });
            return api.sumTokens({ owner: tokenVault, tokens });
        },
    };
});
