const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs');

// TroveManager holds total system collateral (deposited FIL)
const TROVE_MANAGER_ADDRESS = '0x5aB87c2398454125Dd424425e39c8909bBE16022';

function getTVL(
    TROVE_MANAGER_ADDRESS,
    { nonNativeCollateralToken = false, abis = {}, collateralToken } = {}
) {
    return async api => {
        const activePool = await api.call({
            target: TROVE_MANAGER_ADDRESS,
            abi: abis.activePool ?? 'address:activePool',
        });
        const defaultPool = await api.call({
            target: TROVE_MANAGER_ADDRESS,
            abi: 'address:defaultPool',
        });
        let token = nullAddress;
        if (collateralToken) token = collateralToken;
        else if (nonNativeCollateralToken)
            token = await api.call({
                target: TROVE_MANAGER_ADDRESS,
                abi: abis.collateralToken ?? 'address:collateralToken',
            });
        return sumTokens2({
            api,
            owners: [activePool, defaultPool],
            tokens: [token],
        });
    };
}

module.exports = {
    start: '2025-03-21',
    filecoin: {
        tvl: getTVL(TROVE_MANAGER_ADDRESS),
    },
};
