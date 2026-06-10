const sdk = require('@defillama/sdk');
const BN = require("bignumber.js");

const supplyPools = [
    // usdc
    { virtualBalance: "0x10A377BA353cd480E43800018a27742054904c1a", decimals: 6, coinName: "usd-coin" },
    // dai
    { virtualBalance: "0x2FbE41e4861B5d0936AA01bB32bd3402d34f11fA", decimals: 18, coinName: "dai" },
    // wbtc
    { virtualBalance: "0xcc29655C9F9A211fb11c25D905306aa93a685ef3", decimals: 8, coinName: "wrapped-bitcoin" },
    // eth
    { virtualBalance: "0x6d18E830A938F0eAF206f1BD80b79a851E5f37A3", decimals: 18, coinName: "ethereum" },
]

async function getTotalSupply(pools, api) {
    const totalSupplies = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: pools.map(pool => pool.virtualBalance),
    });
    pools.forEach((p, i) => {
        p.totalSupply = new BN(totalSupplies[i]);
        p.totalSupplyString = p.totalSupply.toString();
    });

    return pools;
}

async function tvl(api) {
    const balances = {}
    const pools = await getTotalSupply(supplyPools, api);
    for (let pool of pools)
        sdk.util.sumSingleBalance(balances, pool.coinName, pool.totalSupply/(10 ** pool.decimals))

    return balances;
}

module.exports = {
    tvl
};
