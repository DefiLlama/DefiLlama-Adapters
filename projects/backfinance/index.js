const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const BackConfig = "0x51b4fa29dA61715d3384Be9f8a7033bD349Ef629";

const calcTvl = async (balances, chain, block, factoryAddr, poolAddrs, token, balance) => {
    const backFactory = (await sdk.api.abi.call({
        abi: factoryAddr,
        target: BackConfig,
        block,
        chain
    })).output;

    const poolAddresses = (await sdk.api.abi.call({
        abi: poolAddrs,
        target: backFactory,
        block,
        chain
    })).output;

    const tokens = (await sdk.api.abi.multiCall({
        abi: token,
        calls: poolAddresses.map(pool => ({
            target: pool
        })),
        block,
        chain
    })).output.map(t => t.output);

    if (balance == erc20.balanceOf) {
        const balancePools = (await sdk.api.abi.multiCall({
            abi: balance,
            calls: poolAddresses.map((pool, idx) => ({
                target: tokens[idx],
                params: pool
            })),
            block,
            chain
        })).output.map(bp => bp.output);

        for (let index = 0; index < poolAddresses.length; index++) {
            sdk.util.sumSingleBalance(
                balances,
                `heco:${tokens[index]}`,
                balancePools[index]
            );
        }
    } else {
        const balancePools = (await sdk.api.abi.multiCall({
            abi: balance,
            calls: poolAddresses.map(pool => ({
                target: pool
            })),
            block,
            chain
        })).output.map(bp => bp.output);

        for (let index = 0; index < poolAddresses.length; index++) {
            sdk.util.sumSingleBalance(
                balances,
                `heco:${tokens[index]}`,
                balancePools[index]
            );
        }
    }
}

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    //  --- Single token pool TVL portion ---
    await calcTvl(
        balances,
        "heco",
        chainBlocks["heco"],
        abi.poolFactory,
        abi.getPools,
        abi.supplyToken,
        erc20.balanceOf
    );

    //  --- Pairs pool TVL portion ---
    await calcTvl(
        balances,
        "heco",
        chainBlocks["heco"],
        abi.pairFactory,
        abi.getPairs,
        abi.token0,
        abi.totalBorrowToken0,
    );

    await calcTvl(
        balances,
        "heco",
        chainBlocks["heco"],
        abi.pairFactory,
        abi.getPairs,
        abi.token1,
        abi.totalBorrowToken1,
    );

    return balances;
};

module.exports = {
    heco: {
        tvl: hecoTvl,
    },
    tvl: sdk.util.sumChainTvls([hecoTvl]),
};