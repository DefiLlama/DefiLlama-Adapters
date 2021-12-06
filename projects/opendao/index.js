const sdk = require("@defillama/sdk");
const abi = require("./abi.json")
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

/*** Ethereum Addresses ***/
const comptroller = "0x959Fb43EF08F415da0AeA39BEEf92D96f41E41b3";
const OPEN = "0x69e8b9528CABDA89fe846C67675B5D73d463a916";

const farmContract = "0x9C3c5a058B83CBbE3Aa0a8a8711c2BD5080ccCa7";

/*** BSC Addresses ***/
const comptrollersBSC = [
    // pOPEN Vault
    "0x5AcEc8328f41145562548Dd335556c12559f2913",
    //OCP Vault
    "0xA21d5c762E13FcfC8541558dAce9BA54f1F6176F",
    //LIME Vault
    "0x2240e2A6805b31Bd1BC03bd5190f644334F53b9A",
    //LAND Vault
    "0xdaD9b52fE5ffd4331aaA02321f1ffa400C827EC8"
];

const farmContractsBSC = [
    // Farm ID 41
    "0x92702dcCD53022831edd3FCBfEabbBA31BC29bB6",
    // Farm ID 17
    "0x172E45E4527484ea184F017898102D5e0E94Dc88",
    // Farm ID 42
    "0xb8A177d29417ee325953ec388BA2dBD77B02DdF4",
    // Farm ID 18
    "0x378319C0CdC4dCC09800154a47eF9ee7dAE044B8",
    // Farm ID 60
    "0xeED6E3F11bA173B82Bb913CaC943C0eF290A734a",
    // Farm ID 61
    "0x0ED995cB847185aC3cfDE9d1b8e8f57AB54a7247"
];

const pool2LpsBSC = [
    // OPEN-WETH UNI-V2 LP MAR
    "0x1dDf85Abdf165d2360B31D9603B487E0275e3928",
    // OPEN-USDT UNI-V2 LP DEC
    "0x507d84fe072Fe62A5F2e1F917Be8Cc58BdC53eF8",
    // OPEN-USDT UNI-V2 LP MAR
    "0x507d84fe072Fe62A5F2e1F917Be8Cc58BdC53eF8",
    // OPEN-WETH UNI-V2 LP DEC
    "0x1dDf85Abdf165d2360B31D9603B487E0275e3928",
    // OPEN-WETH UNI-V2 LP MAY
    "0x1dDf85Abdf165d2360B31D9603B487E0275e3928",
    // OPEN-USDT UNI-V2 LP MAY
    "0x507d84fe072Fe62A5F2e1F917Be8Cc58BdC53eF8"
];

const calc = async (balances, balance, comptroller, chain = "ethereum") => {
    let chainBlocks = {};

    const allMarkets = (
        await sdk.api.abi.call({
            abi: abi.getAllMarkets,
            target: comptroller,
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output;

    const getBalance = (
        await sdk.api.abi.multiCall({
            abi: balance,
            calls: allMarkets.map(markets => ({
                target: markets,
            })),
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output.map(bal => bal.output);

    const underlyings = (
        await sdk.api.abi.multiCall({
            abi: abi.underlying,
            calls: allMarkets.map(markets => ({
                target: markets,
            })),
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output.map(under => under.output);

    const symbols = (
        await sdk.api.abi.multiCall({
            abi: abi.symbol,
            calls: underlyings.map(underlying => ({
                target: underlying,
            })),
            chain: chain,
            block: chainBlocks[chain]
        })
    ).output.map(symbol => symbol.output);

    const lpPositions = [];
    underlyings.forEach((underlying, idx) => {
        if (symbols[idx] == 'UNI-V2') {
            lpPositions.push({
                token: underlying,
                balance: getBalance[idx]
            })
        } else {
            sdk.util.sumSingleBalance(balances, `${chain}:${underlying}`, getBalance[idx]);
        }
    });

    await unwrapUniswapLPs(
        balances,
        lpPositions,
        chainBlocks[chain],
        chain,
        addr => `${chain}:${addr}`
    );
};

const bscTvl = async () => {
    const balances = {};

    for (const comptroller of comptrollersBSC) {
        await calc(balances, abi.getCash, comptroller, "bsc");
    }

    return balances;
};

const bscBorrows = async () => {
    const balances = {};

    for (const comptroller of comptrollersBSC) {
        await calc(balances, abi.totalBorrows, comptroller, "bsc");
    }

    return balances;
};

const ethTvl = async () => {
    const balances = {};

    await calc(balances, abi.getCash, comptroller);

    const poolLength = (
        await sdk.api.abi.call({
            abi: abi.poolLength,
            target: farmContract,
        })
    ).output;

    for (let i = 0; i < poolLength; i++) {
        const lpFarm = (
            await sdk.api.abi.call({
                abi: abi.poolInfo,
                target: farmContract,
                params: i
            })
        ).output.lpToken;

        const cashAddress = (
            await sdk.api.abi.call({
                abi: abi.cash,
                target: lpFarm,
            })
        ).output;

        const balance = (
            await sdk.api.erc20.balanceOf({
                target: cashAddress,
                owner: lpFarm
            })
        ).output;

        sdk.util.sumSingleBalance(balances, cashAddress, balance);
    }

    return balances;
};

const ethBorrows = async () => {
    const balances = {};

    await calc(balances, abi.totalBorrows, comptroller);

    return balances;
};

module.exports = {
    misrepresentedTokens: true,
    ethereum: {
        staking: staking(comptroller, OPEN),
        pool2: pool2s(farmContractsBSC, pool2LpsBSC),
        borrow: ethBorrows,
        tvl: ethTvl
    },
    bsc: {
        borrow: bscBorrows,
        tvl: bscTvl,
    },
    methodology:
        "We count liquidity on the Markets same as compound, and we export Borrowing part too",
};
