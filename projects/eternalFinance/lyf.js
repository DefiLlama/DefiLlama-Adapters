const { default: BigNumber } = require("bignumber.js");
const { getResource, coreTokensAptos } = require("../helper/chain/aptos");
const { getPancakeReserveAndLpSupply } = require("./pancake");
const { getTypeArgs, moduleAddress, resourceAddress } = require("./helper");

const allPoolsStruct = `${moduleAddress}::pancake_wmasterchef::AllPools`;

function deserializeLyfPool(pools) {
    /// @dev extract the token types in all pools
    const lpPools = {};
    pools.data.forEach(pool => {
        const [tokenX, tokenY] = getTypeArgs(pool.key);
        lpPools[pool.key] = {
            tokenX,
            tokenY,
            lpName: pool.key,
            lpAmount: pool.value.amount,
        };
    });

    return lpPools;
}

function calculateLyfPoolTokens(lyfPools, api) {
    const balances = {};
    Object.keys(lyfPools).map((key) => {
        const pool = lyfPools[key];
        const { lpAmount, lpSupply, reserveX, reserveY, tokenX, tokenY } = pool;

        const share = new BigNumber(lpAmount).div(lpSupply);
        const balanceX = share.multipliedBy(pool.reserveX).toFixed(0);
        const balanceY = share.multipliedBy(pool.reserveY).toFixed(0);
        lyfPools[key] = {
            ...pool,
            balanceX,
            balanceY,
        }

        const isCoreAssetX = coreTokensAptos.includes(tokenX);
        const isCoreAssetY = coreTokensAptos.includes(tokenY);
        const nonNeglibleReserves = reserveX !== '0' && reserveY !== '0';
        /// @dev calculate total core assets
        if (isCoreAssetX && isCoreAssetY) {
            api.add(tokenX, balanceX);
            api.add(tokenY, balanceY);
        } else if (isCoreAssetX) {
            api.add(tokenX, balanceX);
            if (nonNeglibleReserves) {
                api.add(tokenX, balanceX);
            }
        } else if (isCoreAssetY) {
            api.add(tokenY, balanceY);
            if (nonNeglibleReserves) {
                api.add(tokenY, balanceY);
            }
        }
    })

    return balances;
}

async function lyfTvl(api) {
    /// @dev get pool resources
    const { pools } = await getResource(resourceAddress, allPoolsStruct);
    const allLyfPools = deserializeLyfPool(pools);
    await getPancakeReserveAndLpSupply(allLyfPools);
    calculateLyfPoolTokens(allLyfPools, api);
}

module.exports = {
    lyfTvl,
}
