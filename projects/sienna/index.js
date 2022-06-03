const CosmWasm = require("../helper/CosmWasm");
const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk');
const utils = require("./utils");
const { eachLimit, mapLimit } = require("async");

const factories = [{
    address: "secret1zvk7pvhtme6j8yw3ryv0jdtgg937w0g0ggu8yy",
    code: 111
}, {
    address: "secret18sq0ux28kt2z7dlze2mu57d3ua0u5ayzwp6v2r",
    code: 361
}];

const SIENNA_SINGLE_SIDED_POOLS = [
    { address: "secret1ja57vrpqusx99rgvxacvej3vhzhh4rhlkdkd7w", version: 1 },
    { address: "secret109g22wm3q3nfys0v6uh7lqg68cn6244n2he4t6", version: 2 },
    { address: "secret1uta9zf3prn7lvc6whp8sqv7ynxmtz3jz9xkyu7", version: 3 }
];
const SIENNA_TOKEN_ADDRESS = "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4";
const LEND_OVERSEER_CONTRACT = "secret1pf88n9hm64mn58aw48jxfs2fsvzr07svnrrdlv";

const SECRET_NODE_URL = "https://bridgeapi.azure-api.net/node10";
const queryClient = new CosmWasm(SECRET_NODE_URL)

const CACHED_TOKENS = {};

async function Pairs() {
    return new Promise((resolve, reject) => {
        mapLimit(factories, 1, async (factory) => {
            const result = await queryClient.getContracts(factory.code);
            const pairs = result.filter((p) => p.label.endsWith(`${factory.address}-${factory.code}`));
            return Promise.resolve(pairs);
        }, (err, pairs) => {
            if (err) return reject(err);
            resolve(pairs.flat());
        });
    });
}

async function TokenInfo(tokenAddress) {
    if (CACHED_TOKENS[tokenAddress]) return CACHED_TOKENS[tokenAddress];
    const result = await queryClient.queryContractSmart(tokenAddress, { token_info: {} });
    CACHED_TOKENS[tokenAddress] = result.token_info;
    return result.token_info;
}

async function PairsVolumes() {
    const volumes = []

    const pairs = await Pairs();
    return new Promise((resolve, reject) => {
        eachLimit(pairs, 2, async (contract) => {
            const pair_info = (await queryClient.queryContractSmart(contract.address, "pair_info")).pair_info;

            const token1 = await TokenInfo(pair_info.pair.token_0.custom_token.contract_addr);
            volumes.push({
                tokens: new BigNumber(pair_info.amount_0).div(new BigNumber(10).pow(token1.decimals)).toNumber(),
                symbol: token1.symbol
            });

            const token2 = await TokenInfo(pair_info.pair.token_1.custom_token.contract_addr);
            volumes.push({
                tokens: new BigNumber(pair_info.amount_1).div(new BigNumber(10).pow(token2.decimals)).toNumber(),
                symbol: token2.symbol
            });
        }, (err) => {
            if (err) return reject(err);
            resolve(volumes);
        });
    });
}

async function getLendMarkets() {
    if (!LEND_OVERSEER_CONTRACT) return [];
    let markets = [], grabMarkets = true, start = 0;

    while (grabMarkets) {
        const result = await queryClient.queryContractSmart(LEND_OVERSEER_CONTRACT, {
            markets: {
                pagination: {
                    limit: 10,
                    start: start
                }
            }
        });
        if (result && result.entries && result.entries.length) {
            markets = markets.concat(result.entries);
            start = markets.length;
        } else grabMarkets = false;
    }

    return markets;
}

async function Lend() {
    const markets = await getLendMarkets();
    const block = await queryClient.getHeight();

    return new Promise((resolve, reject) => {
        mapLimit(markets, 1, async (market) => {
            const marketState = await queryClient.queryContractSmart(market.contract.address, {
                state: {
                    block
                }
            });
            const exchange_rate = await queryClient.queryContractSmart(market.contract.address, {
                exchange_rate: {
                    block
                }
            });
            const underlying_asset = await queryClient.queryContractSmart(market.contract.address, { underlying_asset: {} });
            const token = await TokenInfo(underlying_asset.address);

            const tokens_borrowed = new BigNumber(marketState.total_borrows).div(new BigNumber(10).pow(token.decimals).toNumber());
            const tokens_supplied = new BigNumber(marketState.total_supply).times(exchange_rate).div(new BigNumber(10).pow(token.decimals));

            return Promise.resolve({
                symbol: token.symbol,
                tokens: new BigNumber(tokens_supplied).minus(tokens_borrowed).toNumber()
            });
        }, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        })
    })
}

async function StakedTokens() {
    const siennaToken = await TokenInfo(SIENNA_TOKEN_ADDRESS);
    return new Promise(async (resolve, reject) => {
        mapLimit(SIENNA_SINGLE_SIDED_POOLS, 1, async (pool) => {
            let total_locked;
            if (pool.version === 3) {
                const fetchedPool = await queryClient.queryContractSmart(pool.address, { rewards: { pool_info: { at: new Date().getTime() } } });
                total_locked = fetchedPool.rewards.pool_info.staked;
            } else {
                const fetchedPool = await queryClient.queryContractSmart(pool.address, { pool_info: { at: new Date().getTime() } });
                total_locked = fetchedPool.pool_info.pool_locked;
            }
            const tokens = new BigNumber(total_locked).div(new BigNumber(10).pow(siennaToken.decimals)).toNumber();
            return Promise.resolve(tokens);
        }, (err, data) => {
            if (err) return reject(err);
            resolve(data.reduce((total, value) => total + value, 0));
        });
    });

}

async function TVL() {
    const balances = {};

    const pairs_volumes = await PairsVolumes();
    pairs_volumes.map(async volume => {
        if (utils.symbolsMap[volume.symbol])
            sdk.util.sumSingleBalance(balances, utils.symbolsMap[volume.symbol], volume.tokens);
    });

    const lend_data = await Lend();

    lend_data.map(async volume => {
        if (utils.symbolsMap[volume.symbol])
            sdk.util.sumSingleBalance(balances, utils.symbolsMap[volume.symbol], volume.tokens);
    });

    return balances;
}

async function Staked() {
    const balances = {};
    const staked_tokens = await StakedTokens();
    if (staked_tokens)
        sdk.util.sumSingleBalance(balances, "sienna", staked_tokens);
    return balances;
}

async function LendBorrowed() {
    const markets = await getLendMarkets();
    const block = await queryClient.getHeight();
    return new Promise((resolve, reject) => {
        mapLimit(markets, 2, async (market) => {
            const marketState = await queryClient.queryContractSmart(market.contract.address, {
                state: {
                    block
                }
            });
            const underlying_asset = await queryClient.queryContractSmart(market.contract.address, { underlying_asset: {} });
            const token = await TokenInfo(underlying_asset.address);

            const tokens_borrowed = new BigNumber(marketState.total_borrows).div(new BigNumber(10).pow(token.decimals).toNumber());

            return Promise.resolve({
                symbol: token.symbol,
                tokens: new BigNumber(tokens_borrowed).toNumber()
            });
        }, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        })
    })
}

async function Borrowed() {
    const balances = {}

    const lend_data = await LendBorrowed();

    lend_data.map(async volume => {
        if (utils.symbolsMap[volume.symbol])
            sdk.util.sumSingleBalance(balances, utils.symbolsMap[volume.symbol], volume.tokens);
    })

    return balances;
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: 'All tokens locked in SIENNA Network pairs + All the supplied tokens to Sienna Lend Markets + Staked Sienna;',
    secret: {
        tvl: TVL,
        staking: Staked,
        borrowed: Borrowed
    }
}