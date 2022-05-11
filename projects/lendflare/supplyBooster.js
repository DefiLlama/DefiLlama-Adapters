const sdk = require('@defillama/sdk');
const BN = require("bignumber.js");
const utils = require('./utils.js');

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

async function getTotalSupply(pools, timestamp, block, chainBlocks) {
    const output = (await sdk.api.abi.multiCall({
        block: chainBlocks.ethereum,
        chain: "ethereum",
        abi: 'erc20:totalSupply',
        calls: pools.map((pool, i) => {
            return {
                target: pool.virtualBalance
            }
        })
    })).output.map((result, i) => {
        for (p of pools) {
            if (p.virtualBalance == result.input.target) {
                p.totalSupply = (new BN(result.output));
                p.totalSupplyString = p.totalSupply.toString();
            }
        }
    });

    return pools;
}

async function tvl(timestamp, block, chainBlocks) {
    let tvl = new BN(0);

    const pools = await getTotalSupply(supplyPools, timestamp, block, chainBlocks);
    const prices = await utils.getPricesfromString().then(result => {
        return result.data;
    });

    for (let pool of pools) {
        pool.tvl = pool.totalSupply.dividedBy(10 ** pool.decimals).multipliedBy(new BN(prices[pool.coinName].usd));

        tvl = tvl.plus(pool.tvl);
    };

    return tvl;
}

module.exports = {
    tvl
};
