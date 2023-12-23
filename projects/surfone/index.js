const factory = require("./PoolFactory.json")
const sdk = require("@defillama/sdk");
const ADDRESSES = require("../helper/coreAssets.json");

const WETH = ADDRESSES.base.WETH;
const USDC = ADDRESSES.base.USDC;
const chain = 'base'
const factoryContract = '0x5FeD7c030a1B3b40988984479Fdd666dE81038A3'

async function getTvl(timestamp, block, chainBlock) {
    const b = chainBlock.base;
    const { output: pools } = await sdk.api.abi.call({
        abi: factory["getAllPools"],
        target: factoryContract,
        chain: chain,
        block:b
    });
    let wethPools = [];
    let usdcPools = [];

    pools?.forEach((item) => {
        const {baseToken} = item;
        if (baseToken.toLowerCase() === WETH.toLowerCase()) {
            wethPools.push(item.pool);
        } else if (baseToken.toLowerCase() === USDC.toLowerCase()) {
            usdcPools.push(item.pool);
        }
    });

    let balances = (
        await sdk.api.abi.multiCall({
            abi: "erc20:balanceOf",
            calls: usdcPools.map((address) => ({
                target: USDC,
                params: address,
            })),
            block:b,
            chain:chain
        })
    ).output;

    let wethBalances = (
        await sdk.api.abi.multiCall({
            abi: "erc20:balanceOf",
            calls: wethPools.map((address) => ({
                target: WETH,
                params: address,
            })),
            block:b,
            chain:chain
        })
    ).output;

    let usdcTvl = balances.reduce((pre, next) => {
        return pre + parseInt(next.output);
    }, 0);
    let wethTvl = wethBalances.reduce((pre, next) => {
        return pre + parseInt(next.output);
    },0)

    let tvl = {};

    tvl[ADDRESSES.ethereum.USDC] = usdcTvl;
    tvl[ADDRESSES.ethereum.WETH] = wethTvl;

    return tvl;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    start: 		8048857,
    base: {
        tvl: getTvl,
    },
    methodology: "Count the total balance across all fee pools for all trading pairs.",
}

