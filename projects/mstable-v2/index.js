const {CONFIG_DATA} = require("./config");
const {DHEDGE_FACTORY_ABI, DHEDGE_POOL_LOGIC_ABI, MSTABLE_POOL_MANAGER_LOGIC_ABI} = require("./abis");
const sdk = require("@defillama/sdk");


async function getLockedAssetsForFunds(api) {
    const { chain, } = api
    const { dhedgeFactory, mstableManager } = CONFIG_DATA[chain];

    const pools = await api.call({
        abi: DHEDGE_FACTORY_ABI,
        target: dhedgeFactory,
        params: [mstableManager],
    });

    const poolManagerLogicAddresses = await api.multiCall({
        abi: DHEDGE_POOL_LOGIC_ABI,
        calls: pools,
        permitFailure: true
    });

    const fundCompositions = await api.multiCall({
        abi: MSTABLE_POOL_MANAGER_LOGIC_ABI,
        calls: poolManagerLogicAddresses,
        permitFailure: true
    });

    return fundCompositions.map(composition => {
        return composition.assets.reduce(
            (lockedTokens, [address], i) => ({ ...lockedTokens, [address]: composition.balances[i] }),
        {},
        )
    })
}


async function tvlForChain(api) {
    const { chain, } = api
    const isEthereum = chain === 'ethereum';

    const assetBalances = await getLockedAssetsForFunds(api);

    const lockedBalances = {};

    assetBalances
        .forEach((locked) => Object.entries(locked)
            .map(([underlying, balance]) => (
                [isEthereum ? underlying : `${chain}:${underlying}`, balance]
            ))
            .forEach(([address, balance]) =>
                sdk.util.sumSingleBalance(lockedBalances, address, balance)
            )
        );

    return lockedBalances;

}

module.exports = {
    misrepresentedTokens: true,
    start: '2025-08-12', // Friday, August 8, 2025 12:00:00 AM
    methodology:
        "Aggregates total value of each mStable vaults on Ethereum",
    ethereum: {
        tvl: tvlForChain,
    },

};
