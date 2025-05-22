const contractsProviderAbi = require('./abi/contract-provider');
const collateralAbi = require('./abi/collateral');
const contractProvider = '0xB5855E692465B6c1B5172fCaF59Ac67F20621A4d';

const RelatedCOntractCollateralManager = 1;

const tvl = async (api) => {
    const [marketIds] = await Promise.all([
        api.call({
            abi: contractsProviderAbi.getMarketIds,
            target: contractProvider,
            params: [0, 1000],
        })
    ]);

    const collateralManagers = await api.multiCall({
        abi: contractsProviderAbi.getMarketRelatedContractAddress,
        calls: marketIds.map(marketId => ({
            target: contractProvider,
            params: [marketId, RelatedCOntractCollateralManager],
        })),
    });

    const underlyingTokens = await api.multiCall({
        abi: collateralAbi.getUnderlyingToken,
        calls: collateralManagers.map(addr => ({ target: addr })),
    });

    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: collateralManagers.map((manager, i) => ({
            target: underlyingTokens[i],
            params: [manager],
        })),
    });

    api.add(underlyingTokens, balances);
}

module.exports = {
    arbitrum: {
        tvl: tvl
    }
};
