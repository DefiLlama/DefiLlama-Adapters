const contractsProviderAbi = require('./abi/contract-provider');
const collateralAbi = require('./abi/collateral');
const marketAbi = require('./abi/market');

const contractProvider = '0xB5855E692465B6c1B5172fCaF59Ac67F20621A4d';

const tvl = async (api) => {
    const [marketAddresses] = await Promise.all([
        api.call({
            abi: contractsProviderAbi.getMarketAddresses,
            target: contractProvider,
            params: [0, 1000],
        })
    ]);

    const collateralManagers = await api.multiCall({
        abi: marketAbi.getCollateralManager,
        calls: marketAddresses.map(addr => ({ target: addr })),
    });

    const tokenAddresses = await api.multiCall({
        abi: collateralAbi.getUnderlyingToken,
        calls: collateralManagers.map((addr) => ({ target: addr })),
    });

    const balances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: collateralManagers.map((manager, i) => ({
            target: tokenAddresses[i],
            params: [manager],
        })),
    });

    api.add(tokenAddresses, balances)
}

module.exports = {
    arbitrum: {
        tvl: tvl
    }
};
