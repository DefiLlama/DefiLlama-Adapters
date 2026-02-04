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

async function getTokenBalance(marketContractId, tokenId) {
    const contractAddress = alephium.addressFromContractId(marketContractId);
    if (tokenId === ALPH_TOKEN_ID) {
        return BigInt((await alephium.getAlphBalance(contractAddress)).balance);
    } else {
        const tokensBalance = await alephium.getTokensBalance(contractAddress);
        const tokenBalance = tokensBalance.find(b => b.tokenId === tokenId);
        return BigInt(tokenBalance?.balance ?? 0);
    }
}

async function tvl(api) {
    const markets = await getMarkets();
    const tokenAmounts = new Map();
    for (const market of markets) {
        const collateral = await getTokenBalance(market.contractId, market.collateralTokenId);
        const loanBalance = await getTokenBalance(market.contractId, market.loanTokenId);
        tokenAmounts.set(market.collateralTokenId, (tokenAmounts.get(market.collateralTokenId) ?? BigInt(0)) + collateral);
        tokenAmounts.set(market.loanTokenId, (tokenAmounts.get(market.loanTokenId) ?? BigInt(0)) + loanBalance);
    }

    for (const [tokenId, amount] of tokenAmounts.entries()) {
        api.add(tokenId, amount);
    }
}

async function borrowed(api) {
    const markets = await getMarkets();
    const tokenAmounts = new Map();
    for (const market of markets) {
        const state = await alephium.contractMultiCall([{
            group: 0,
            address: config.linx,
            methodIndex: MARKET_METHOD_INDEX,
            args: [{ type: "ByteVec", value: market.marketId }]
        }]);
        const borrowAssets = BigInt(state[0].returns[2].value);
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