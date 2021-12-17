const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const pool_factoryV1 = "0x20dC7DA7cFc8F5b465060496a170229dc4A47A87";
const pool_factoryV2 = "0xCD21ef2220596cba4A7DaE59b5eeeA6dB7859df7";

const toAddr = (d) => "0x" + d.substr(26);

const calc = async (balances, block, factory) => {

    const START_BLOCK = 11259517; // 11971199 -> start block for Factory Pool V2
    const END_BLOCK = block;
    const events = (
        await sdk.api.util.getLogs({
            target: factory,
            topic: `LOG_NEW_POOL(address,address)`,
            keys: [],
            fromBlock: START_BLOCK,
            toBlock: END_BLOCK,
        })
    ).output;

    const pools = events.map((event) => toAddr(event.topics[2]));

    for (const pool of pools) {
        const tokens = (
            await sdk.api.abi.call({
                abi: abi.getCurrentTokens,
                target: pool,
            })
        ).output;

        for (const token of tokens) {
            const getBalance = (
                await sdk.api.abi.call({
                    abi: erc20.balanceOf,
                    target: token,
                    params: pool,
                })
            ).output;

            sdk.util.sumSingleBalance(balances, token, getBalance);
        }
    }
};

const ethTvl = async (ethBlock) => {
    const balances = {};

    /*** Pool V1 TVL Portion ***/
    await calc(balances, ethBlock, pool_factoryV1)

    /*** Pool V2 TVL Portion ***/
    await calc(balances, ethBlock, pool_factoryV2)

    return balances;
};

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        tvl: ethTvl,
    },
    methodology:
        "Counts tvl on the Pools through MFactory (V1 and V2) Contracts",
};
