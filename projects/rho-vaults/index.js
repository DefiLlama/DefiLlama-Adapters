const vaultAbi = require('./abi/base.js');
const contractsProviderAbi = require('./abi/contract-provider.js');
const { getOraclePackages } = require('./oracle.js');
const contractProvider = '0x6544779Ba9747cFA20a9b837C9547DE2e0cbf071';
const vaultId = '0x75671e1fd10680df33ace780f2b92bc4d51be5f35f1d63c5ad7d0af7a0281d2c'



const tvl = async (api) => {
    const [vaultAddress, oraclePackages] = await Promise.all([
        api.call({
            abi: contractsProviderAbi.getVaultAddressById,
            target: contractProvider,
            params: [vaultId],
        }),
        getOraclePackages()
    ]);


    const marketIds = await api.call({
        abi: vaultAbi.getAllMarketIds,
        target: vaultAddress,
    });

    if (!marketIds.length) return { tether: 0 };

    const input = marketIds.map((marketId) => {
        const pkg = oraclePackages.find(p => p.marketId.toLowerCase() === marketId.toLowerCase());
        if (!pkg) return null;

        return {
            marketId,
            packages: [
                {
                    marketId: pkg.marketId,
                    timestamp: Number(pkg.timestamp),
                    signature: pkg.signature,
                    indexValue: pkg.indexValue,
                }
            ]
        };
    }).filter(Boolean);

    if (!input.length) return { tether: 0 };

    const totalAssets = await api.call({
        abi: vaultAbi.totalAssets,
        target: vaultAddress,
        params: [input],
    });


    return {
        tether: Number(totalAssets) / 1e6, // Convert to USDT
    };

}

module.exports = {
    arbitrum: {
        tvl: tvl
    }
};
