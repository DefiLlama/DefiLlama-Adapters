const { default: BigNumber } = require("bignumber.js");
const { getResource, coreTokensAptos } = require("../helper/chain/aptos");
const { getResources } = require("../helper/chain/aptos");

const pancakeModuleAddress = '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa';
const pancakeTokenPairReservePrefix = `${pancakeModuleAddress}::swap::TokenPairReserve<`;
const pancakeLpCoinInfoPrefix = `0x1::coin::CoinInfo<${pancakeModuleAddress}::swap::LPToken<`;

function getLpTokenAddress(t0, t1) {
    return `${pancakeModuleAddress}::swap::LPToken<${t0}, ${t1}>`
}

/// @dev fetch all pancakeswap pool and map with lyf pool
async function getPancakeReserveAndLpSupply(lyfPools) {
    const resources = await getResources(pancakeModuleAddress);
    resources.forEach(({type, data}) => {
        if (type.slice(0, pancakeTokenPairReservePrefix.length) === pancakeTokenPairReservePrefix) {
            /// @dev get token reserves
            const [tx, ty] = getTypeArgs(type);
            const lpAddress = getLpTokenAddress(tx, ty);
            if (lyfPools[lpAddress]) {
                lyfPools[lpAddress] = {
                    ...lyfPools[lpAddress],
                    reserveX: data.reserve_x,
                    reserveY: data.reserve_y,
                }
            }
        } else if (type.slice(0, pancakeLpCoinInfoPrefix.length) === pancakeLpCoinInfoPrefix) {
            /// @dev extract total lp supply
            const [tx, ty] = getTypeArgs(`<${type.split(pancakeLpCoinInfoPrefix)[1]}`);
            const lpAddress = getLpTokenAddress(tx, ty);
            if (lyfPools[lpAddress]) {
                lyfPools[lpAddress] = {
                    ...lyfPools[lpAddress],
                    lpSupply: data.supply.vec?.[0].integer.vec?.[0].value || '0',
                }
            }
        }
    })
}
const moduleAddress = '0x25a64579760a4c64be0d692327786a6375ec80740152851490cfd0b53604cf95';
const resourceAddress = '0x25a64579760a4c64be0d692327786a6375ec80740152851490cfd0b53604cf95';

function getTypeArgs(struct) {
    return struct.split('<')[1].split('>')[0].split(', ');
}

// --- inlined from ./lyf ---
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

        /// @dev skip pools whose pancake reserves/supply weren't resolved (LP no longer exists) -> avoids NaN balances
        if (lpSupply === undefined || reserveX === undefined || reserveY === undefined) return;

        const share = new BigNumber(lpAmount).div(lpSupply);
        /// @dev skip empty/degenerate pools (lpSupply 0 -> share Infinity -> NaN balances)
        if (!share.isFinite()) return;
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

// --- inlined from ./lending ---
const vaultInfoStruct = `${moduleAddress}::vault::Vaults`;

async function lendingTvl(api) {
    /// @dev get vault info resources
    const { vaults } = await getResource(resourceAddress, vaultInfoStruct);
    vaults.data.forEach((vault) => {
        const token = vault.key;
        const balance = vault.value.balance;

        const isCoreAsset = coreTokensAptos.includes(token);
        if (isCoreAsset) {
            api.add(token, balance);
        }
    });

}

async function tvl(api) {
  await lyfTvl(api);
  await lendingTvl(api);
}

module.exports = {
  timetravel: false,
  aptos: {
    tvl,
  }
}
