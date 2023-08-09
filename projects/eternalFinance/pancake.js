const { getResources } = require("../helper/chain/aptos");
const { getTypeArgs } = require("./helper");

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

module.exports = {
    getPancakeReserveAndLpSupply,
}
