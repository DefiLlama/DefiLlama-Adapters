const { CosmWasmClient } = require("secretjs");
const axios = require("axios");
const retry = require("../helper/retry");
const BigNumber = require("bignumber.js");
const sdk = require('@defillama/sdk');

const BACKEND_URL = "https://ethereumbridgebackend.azurewebsites.net/";
const SECRET_NODE_URL = "https://bridgeapi.azure-api.net/proxy/";
const SIENNA_CONTRACT_ADDRESS = "secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4";
const LEND_OVERSEER_CONTRACT = null;

const utils = require("./utils");

const queryClient = new CosmWasmClient(SECRET_NODE_URL);

async function Tokens() {

    return (await retry(
        async () =>
            axios({
                method: "GET",
                baseURL: BACKEND_URL,
                url: "tokens"
            })
    )).data.tokens;
}

async function Pairs() {
    return (await retry(
        async () =>
            axios({
                method: "GET",
                baseURL: BACKEND_URL,
                url: "secretswap_pairs"
            }))
    ).data.pairs.map(pair => pair.contract_addr);
}


async function SiennaSingleSidedPools() {
    return (await retry(
        async () =>
            axios({
                method: "GET",
                baseURL: BACKEND_URL,
                url: "rewards"
            })
    )).data.pools.filter(pool => pool.inc_token.address === SIENNA_CONTRACT_ADDRESS);
}

function TokenByAddress(tokenAddress, tokens) {
    return tokens.find(token => token.dst_address === tokenAddress);
}

async function PairsVolumes(pairs, tokens) {
    const volumes = []
    await Promise.all(pairs.map(async contract => {
        const pair_info = (await queryClient.queryContractSmart(contract, "pair_info")).pair_info;

        const token1 = TokenByAddress(pair_info.pair.token_0.custom_token.contract_addr, tokens)
        volumes.push({
            tokens: new BigNumber(pair_info.amount_0).div(new BigNumber(10).pow(token1.decimals)).toNumber(),
            tokenSymbol: token1.display_props.symbol
        });

        const token2 = TokenByAddress(pair_info.pair.token_1.custom_token.contract_addr, tokens)
        volumes.push({
            tokens: new BigNumber(pair_info.amount_1).div(new BigNumber(10).pow(token2.decimals)).toNumber(),
            tokenSymbol: token2.display_props.symbol
        });
    }));
    return volumes;
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

async function Lend(tokens) {
    const markets = await getLendMarkets();
    const block = await queryClient.getHeight();
    return Promise.all(markets.map(async (market) => {
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
        const token = TokenByAddress(underlying_asset.address, tokens);
        return {
            tokenSymbol: token.display_props.symbol,
            tokens_supplied: new BigNumber(marketState.total_supply).times(exchange_rate).div(new BigNumber(10).pow(token.decimals)).toNumber(),
            tokens_borrowed: new BigNumber(marketState.total_borrows).div(new BigNumber(10).pow(token.decimals).toNumber()).toNumber(),
        };
    }));
}

async function StakedTokens(tokens) {
    const contracts = await SiennaSingleSidedPools();
    const siennaToken = TokenByAddress(SIENNA_CONTRACT_ADDRESS, tokens);
    const stakedTokens = await Promise.all(contracts.map(async (contract) => {
        let total_locked;
        if (contract.version === "3") {
            const fetchedPool = await queryClient.queryContractSmart(contract.rewards_contract, { rewards: { pool_info: { at: new Date().getTime() } } });
            total_locked = fetchedPool.rewards.pool_info.staked;
        } else {
            const fetchedPool = await queryClient.queryContractSmart(contract.rewards_contract, { pool_info: { at: new Date().getTime() } });
            total_locked = fetchedPool.pool_info.pool_locked;
        }
        return new BigNumber(total_locked).div(new BigNumber(10).pow(siennaToken.decimals)).toNumber();
    }));
    return stakedTokens.reduce((total, value) => total + value, 0);
}

async function TVL() {
    const balances = {};

    const tokens = await Tokens();
    const pairs = await Pairs();

    const pairs_volumes = await PairsVolumes(pairs, tokens);
    await Promise.all(pairs_volumes.map(async volume => {
        if (utils.symbolsMap[volume.tokenSymbol]) await sdk.util.sumSingleBalance(balances, utils.symbolsMap[volume.tokenSymbol], volume.tokens);
    }));

    const staked_tokens = await StakedTokens(tokens);
    if (staked_tokens) await sdk.util.sumSingleBalance(balances, "sienna", staked_tokens);

    const lend_data = await Lend(tokens);

    await Promise.all(lend_data.map(async volume => {
        if (utils.symbolsMap[volume.tokenSymbol]) {
            
            await sdk.util.sumSingleBalance(balances, utils.symbolsMap[volume.tokenSymbol], volume.tokens_supplied);
        }
    }));

    return balances;
}

async function Staked() {
    const balances = {};

    const tokens = await Tokens();
    const staked_tokens = await StakedTokens(tokens);
    if (staked_tokens) await sdk.util.sumSingleBalance(balances, "sienna", staked_tokens);

    return balances;
}

async function Borrowed() {
    const balances = {};

    const tokens = await Tokens();
    
    const lend_data = await Lend(tokens);
    await Promise.all(lend_data.map(async volume => {
        if (utils.symbolsMap[volume.tokenSymbol]) {
            await sdk.util.sumSingleBalance(balances, utils.symbolsMap[volume.tokenSymbol], volume.tokens_borrowed);
        }
    }));

    return balances;
}

async function Pool2() {
    const balances = {};

    const tokens = await Tokens();
    const pairs = await Pairs();

    const pairs_volumes = await PairsVolumes(pairs, tokens);
    await Promise.all(pairs_volumes.map(async volume => {
        if (utils.symbolsMap[volume.tokenSymbol]) await sdk.util.sumSingleBalance(balances, utils.symbolsMap[volume.tokenSymbol], volume.tokens);
    }));

    return balances;
}


module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: 'All tokens locked in SIENNA Network pairs + All the supplied tokens to Sienna Lend Markets + Staked Sienna; borrowed tokens across all markets',
    secret: {
        staking: Staked,
        pool2: Pool2,
        borrowed: Borrowed,
        tvl: TVL
    },

};