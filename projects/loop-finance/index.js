const sdk = require("@defillama/sdk");
const { fetchURL } = require('../helper/utils')
const { getBalance, getDenomBalance } = require("../helper/terra");
const { getBlock } = require("../helper/getBlock");

async function getPairs() {
    const factory00 = (await fetchURL(
        queries.baseUrl + queries.factory0 + queries.query30
    )).data.result.pairs;
    const factory01 = (await fetchURL(
        queries.baseUrl + queries.factory0 + queries.factory0query60
    )).data.result.pairs;
    const factory10 = (await fetchURL(
        queries.baseUrl + queries.factory1 + queries.query30
    )).data.result.pairs;

    if (factory01.length > 29 || factory10.length > 29) {
        throw new Error(`We need another query since they're capped at 30 results and pools may be missing`);
    };

    return factory00.concat(factory01, factory10);
};

const tokenMapping = {
    "terra17wkadg0tah554r35x6wvff0y5s7ve8npcjfuhz": "prism-yluna",
    "terra1hzh9vpxhsk8253se0vv5jj6etdvxu3nv8z07zu": "anchorust",
    "terra1kcthelkax4j9x8d3ny6sdag0qmxxynl3qtcrpy": "pylon-protocol",
    "terra1nef5jf6c7js9x6gkntlehgywvjlpytm7pcgkn4": "loop-token",
    "terra1tlgelulz9pdkhls6uglfn5lmxarx7f2gxtdzh2": "prism-pluna",
    "terra1w8kvd6cqpsthupsk4l0clwnmek4l3zr7c84kwq": "angel-protocol",
    "terra1xfsdgcemqwxp4hhnyk4rle6wr22sseq7j07dnn": "kujira",
    "uusd": "terrausd",
    "uluna": "terra-luna",
    // waiting on team for these IBC token tickers
    "ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B": "undefined",
    "ibc/18ABA66B791918D51D33415DA173632735D830E2E77E63C91C11D3008CFD5262": "undefined",
    "ibc/EB2CED20AB0466F18BE49285E56B31306D4C60438A022EA995BA65D5E3CF7E09": "undefined",
};

const queries = {
    "baseUrl": 'https://fcd.terra.dev/wasm/contracts/',
    "factory0": 'terra16hdjuvghcumu6prg22cdjl96ptuay6r0hc6yns',
    "factory1": 'terra10fp5e9m5avthm76z2ujgje2atw6nc87pwdwtww',
    "query30": '/store?query_msg=%7B%22pairs%22:%7B%22limit%22:30%7D%7D',
    "factory0query60": '/store?query_msg=%7B%22pairs%22:%7B%22start_after%22:[%7B%22token%22:%7B%22contract_addr%22:%22terra1mj4rkdr2l5cvse8089z45mlp5dxx0hrjy5ts94%22%7D%7D,%7B%22native_token%22:%7B%22denom%22:%22uusd%22%7D%7D],%22limit%22:30%7D%7D'
};

async function isDenom(balances, pair, block, index) {
    if (pair.asset_infos[index].native_token) {
        if (!tokenMapping[pair.asset_infos[index].native_token.denom]) {
            throw new Error(`no mapping for token ${pair.asset_infos[index].native_token.denom}`);
        };

        sdk.util.sumSingleBalance(
            balances,
            tokenMapping[pair.asset_infos[index].native_token.denom],
            2 * (await getDenomBalance(
                pair.asset_infos[index].native_token.denom,
                pair.contract_addr,
                block
            )) / 10 ** 6
        );

        return true;
    };
};

async function isToken(balances, pair, block, index) {
    if (tokenMapping[pair.asset_infos[index].token.contract_addr]) {
        if (!tokenMapping[pair.asset_infos[index].token.contract_addr]) {
            throw new Error(`no mapping for token ${pair.asset_infos[index].token.contract_addr}`);
        };

        sdk.util.sumSingleBalance(
            balances,
            tokenMapping[pair.asset_infos[index].token.contract_addr],
            2 * (await getBalance(
                pair.asset_infos[index].token.contract_addr,
                pair.contract_addr,
                block
            )) / 10 ** 6
        );

        return true;
    };
};

async function tvl(timestamp, block, chainBlocks) {
    const balances = {};
    block = await getBlock(timestamp, "terra", chainBlocks, true);
    const pairs = await getPairs();
    for (let pair of pairs) {
        (await isDenom(balances, pair, block, 0)) || (await isDenom(balances, pair, block, 1)) ||
            (await isToken(balances, pair, block, 0)) || (await isToken(balances, pair, block, 1))
    };
    return balances;
};

module.exports = {
    timetravel: false,
    terra: {
        tvl
    }
};