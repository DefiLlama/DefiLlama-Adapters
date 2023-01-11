const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { createIncrementArray } = require("../helper/utils");
const { transformPolygonAddress } = require("../helper/portedTokens");

const POOL_FACTORY = "0xC2e0398232440Ce90C40acA123433Ca6c9a025B8";

async function getPoolsParameters(block, chain) {
    const poolsLength = (await sdk.api.abi.call({
        target: POOL_FACTORY,
        abi: abi.pid,
        chain,
        block,
    })).output;

    const params = createIncrementArray(poolsLength).map(i => ({ params: i }));

    const { output: pools } = (await sdk.api.abi.multiCall({
        target: POOL_FACTORY,
        abi: abi.pidToPoolAddress,
        calls: params,
        chain,
        block
    }));

    const calls = pools.map(i => ({ target: i.output }));

    const { output: poolCollateralsAssets } = await sdk.api.abi.multiCall({
        abi: abi.collateralAssets,
        calls,
        chain,
        block,
    });

    const { output: poolLentAssets } = await sdk.api.abi.multiCall({
        abi: abi.lentAsset,
        calls,
        chain,
        block,
    });

    return {
        poolsLength,
        pools,
        poolCollateralsAssets,
        poolLentAssets
    }
}

function chainTvl(chain) {
    return async (_, _1, chainBlocks) => {
        const block = chainBlocks[chain];

        const {
            poolsLength,
            poolCollateralsAssets,
            poolLentAssets
        } = await getPoolsParameters(block, chain);

        const balances = {};

        // Iterate over each pool and get the balance of each collateral asset
        // and its lent asset recorded value in the contract
        for (let i = 0; i < poolsLength; i++) {
            // Object representing the returned from the call value
            const poolObj = poolCollateralsAssets[i];
            // Extract the current pool address
            const poolAddress = poolObj.input.target;
            // Get collaterals array in from the current `poolObj`
            const collateralAssets = poolObj.output;
            // Get lent asset from the current `poolObj`
            const lentAsset = poolLentAssets[i].output;

            let balanceCalls = [];

            for (let j = 0; j < collateralAssets.length; j++) {
                // Collateral asset
                const collateralAsset = collateralAssets[j];
                balanceCalls.push({
                    target: collateralAsset,
                    params: poolAddress,
                })
            }

            balanceCalls.push({
                target: lentAsset,
                params: poolAddress,
            })

            const tokenBalances = (
                await sdk.api.abi.multiCall({
                    abi: 'erc20:balanceOf',
                    calls: balanceCalls,
                    block,
                    chain,
                })
            );

            const borrowed = (await sdk.api.abi.call({
                target: poolAddress,
                abi: abi.borrowed,
                chain,
                block,
            })).output;

            if (chain === "polygon") {
                transform = await transformPolygonAddress()
            }

            sdk.util.sumSingleBalance(balances, lentAsset, borrowed, chain);
            sdk.util.sumMultiBalanceOf(balances, tokenBalances, true, transform);
        }

        return balances;
    }
}


function chainBorrowed(chain) {
    return async (_, _1, chainBlocks) => {
        const block = chainBlocks[chain];

        const balances = {};

        const {
            poolsLength,
            poolCollateralsAssets,
            poolLentAssets
        } = await getPoolsParameters(block, chain);

        // Iterate over each pool and get the balance of each lent asset recorded value in the contract
        for (let i = 0; i < poolsLength; i++) {
            // Object representing the returned from the call value
            const poolObj = poolCollateralsAssets[i];
            // Extract the current pool address
            const poolAddress = poolObj.input.target;
            // Get lent asset from the current `poolObj`
            const lentAsset = poolLentAssets[i].output;

            const borrowed = (await sdk.api.abi.call({
                target: poolAddress,
                abi: abi.borrowed,
                chain,
                block,
            })).output;

            sdk.util.sumSingleBalance(balances, lentAsset, borrowed, chain);
        }

        return balances;
    }
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: "TVL = cash + borrowed",
    ethereum: {
        tvl: chainTvl("ethereum"),
        borrowed: chainBorrowed("ethereum")
    },
}