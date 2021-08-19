const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const tvlOnPairs = require("../helper/processPairs.js");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformHecoAddress } = require("../helper/portedTokens");

const MASTERCHEF_CONTRACT = "0xa02fF30986211B7ca571AcAE5AD4D25ab1e58426";
const PIPPI_FACTORY  = "0x979efE7cA072b72d6388f415d042951dDF13036e";

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const poolLenth = (await sdk.api.abi.call({
        abi: abi.poolLength,
        target: MASTERCHEF_CONTRACT,
        chain: "heco",
        block: chainBlocks["heco"]
    })).output;

    const lpPositions = [];

    for (let index = 0; index < poolLenth; index++) {
        const token = (await sdk.api.abi.call({
            abi: abi.poolInfo,
            target: MASTERCHEF_CONTRACT,
            params: index,
            chain: "heco",
            block: chainBlocks["heco"]
        })).output[0];

        const lp_balance = (await sdk.api.abi.call({
            abi: erc20.balanceOf,
            target: token,
            params: MASTERCHEF_CONTRACT,
            chain: "heco",
            block: chainBlocks["heco"]
        })).output;

        lpPositions.push({
            token,
            balance: lp_balance,
        });
    }

    const transformAddress = await transformHecoAddress();

    await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks["heco"],
        "heco",
        transformAddress
    );
    
    /* tvl section from Pippiswap grabs aprox 8m out of 15m stated by https://info.pippi.finance/home
    * quite a bunch are pair of "underground" tokens, so lots are defaulted to 0 or decimals details cannot be queried
    */
    await tvlOnPairs("heco", chainBlocks, PIPPI_FACTORY, balances);

    return balances;
};

module.exports = {
    heco: {
        tvl: hecoTvl,
    },
    tvl: sdk.util.sumChainTvls([hecoTvl]),
};