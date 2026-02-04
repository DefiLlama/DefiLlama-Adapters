const alephium = require('../helper/chain/alephium');
const { get } = require('../helper/http');

const config = {
    linx: "vQcfta4Mm32L7Xsb7tYF2rrR76JWxjNv3oia8GPK6x71",
    nodeApiHost: "https://node.mainnet.alephium.org",
}

const ALPH_TOKEN_ID = '0000000000000000000000000000000000000000000000000000000000000000';

const MARKET_CREATED_EVENT_INDEX = 4;
const MARKET_METHOD_INDEX = 4;

async function getEvents(contractAddress) {
    let events = [];
    let start = 0;
    const limit = 100;

    while (true) {
        const response = await get(`${config.nodeApiHost}/events/contract/${contractAddress}?start=${start}&limit=${limit}`);
        events = events.concat(response.events);
        if (!response.events.length || response.nextStart === undefined) break;
        start = response.nextStart;
    }
    return events;
}

async function getMarkets() {
    const events = await getEvents(config.linx);
    let markets = events.filter(e => e.eventIndex === MARKET_CREATED_EVENT_INDEX).map(event => {
        const marketId = event.fields[0].value;
        const contractId = event.fields[1].value;
        const loanTokenId = event.fields[2].value;
        const collateralTokenId = event.fields[3].value;

        return { marketId, contractId, loanTokenId, collateralTokenId };
    });

    markets = Array.from(new Map(markets.map(m => [m.marketId, m])).values());
    return markets;
}

async function getLockedCollateral(marketContractId, collateralTokenId) {
    const contractAddress = alephium.addressFromContractId(marketContractId);
    if (collateralTokenId === ALPH_TOKEN_ID) {
        return BigInt((await alephium.getAlphBalance(contractAddress)).balance);
    } else {
        const tokensBalance = await alephium.getTokensBalance(contractAddress);
        const tokenBalance = tokensBalance.find(b => b.tokenId === collateralTokenId);
        return BigInt(tokenBalance?.balance ?? 0);
    }
}

async function getMarketState(marketId) {
    const contractCalls = [{
        group: 0,
        address: config.linx,
        methodIndex: MARKET_METHOD_INDEX,
        args: [{ type: "ByteVec", value: marketId }]
    }]
    const results = await alephium.contractMultiCall(contractCalls);
    return {
        totalSupplyAssets: BigInt(results[0].returns[0].value),
        totalSupplyShares: BigInt(results[0].returns[1].value),
        totalBorrowAssets: BigInt(results[0].returns[2].value),
        totalBorrowShares: BigInt(results[0].returns[3].value),
        lastUpdate: BigInt(results[0].returns[4].value),
        fee: BigInt(results[0].returns[5].value)
    };
}

async function tvl(api) {
    const markets = await getMarkets();
    const tokenAmounts = new Map();
    for (const market of markets) {
        const state = await getMarketState(market.marketId);
        const idleSupply = state.totalSupplyAssets - state.totalBorrowAssets;
        const collateral = await getLockedCollateral(market.contractId, market.collateralTokenId);
        tokenAmounts.set(market.collateralTokenId, (tokenAmounts.get(market.collateralTokenId) ?? BigInt(0)) + collateral);
        tokenAmounts.set(market.loanTokenId, (tokenAmounts.get(market.loanTokenId) ?? BigInt(0)) + idleSupply);
    }

    for (const [tokenId, amount] of tokenAmounts.entries()) {
        api.add(tokenId, amount);
    }
}

async function borrowed(api) {
    const markets = await getMarkets();
    const tokenAmounts = new Map();
    for (const market of markets) {
        const state = await getMarketState(market.marketId);
        const borrowAssets = state.totalBorrowAssets;
        tokenAmounts.set(market.loanTokenId, (tokenAmounts.get(market.loanTokenId) ?? BigInt(0)) + borrowAssets);
    }

    for (const [tokenId, amount] of tokenAmounts.entries()) {
        api.add(tokenId, amount);
    }
}

module.exports = {
    alephium: {
        tvl,
        borrowed
    }
};