const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { getResource, coreTokens } = require("../helper/chain/aptos");
const { transformBalances } = require("../helper/portedTokens");
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

function calculateLyfPoolTokens(lyfPools) {
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

        const isCoreAssetX = coreTokens.includes(tokenX);
        const isCoreAssetY = coreTokens.includes(tokenY);
        const nonNeglibleReserves = reserveX !== '0' && reserveY !== '0';
        /// @dev calculate total core assets
        if (isCoreAssetX && isCoreAssetY) {
            sdk.util.sumSingleBalance(balances, tokenX, balanceX);
            sdk.util.sumSingleBalance(balances, tokenY, balanceY);
        } else if (isCoreAssetX) {
            sdk.util.sumSingleBalance(balances, tokenX, balanceX);
            if (nonNeglibleReserves) {
                sdk.util.sumSingleBalance(balances, tokenX, balanceX);
            }
        } else if (isCoreAssetY) {
            sdk.util.sumSingleBalance(balances, tokenY, balanceY);
            if (nonNeglibleReserves) {
                sdk.util.sumSingleBalance(balances, tokenY, balanceY);
            }
        }
    })

    return balances;
}

async function lyfTvl() {
    /// @dev get pool resources
    const { pools } = await getResource(resourceAddress, allPoolsStruct);
    const allLyfPools = deserializeLyfPool(pools);
    await getPancakeReserveAndLpSupply(allLyfPools);
    const balances = calculateLyfPoolTokens(allLyfPools);
    const tvl = await transformBalances('aptos', balances);

    return tvl;
}

module.exports = {
    lyfTvl,
}
