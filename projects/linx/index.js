const alephium = require('../helper/chain/alephium');
const { get } = require('../helper/http');

const config = {
    linx: "vQcfta4Mm32L7Xsb7tYF2rrR76JWxjNv3oia8GPK6x71",
    nodeApiHost: "https://node.mainnet.alephium.org",
}

const ALPH_TOKEN_ID = '0000000000000000000000000000000000000000000000000000000000000000';
const WBTC_TOKEN_ID = '383bc735a4de6722af80546ec9eeb3cff508f2f68e97da19489ce69f3e703200';
const WBTC_COINGECKO_ID = 'wrapped-bitcoin';
const WBTC_DECIMALS = 8;

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
    for (const market of markets) {
        const collateral = await getTokenBalance(market.contractId, market.collateralTokenId);
        const loanBalance = await getTokenBalance(market.contractId, market.loanTokenId);
        if (market.collateralTokenId === WBTC_TOKEN_ID) {
            api.addCGToken(WBTC_COINGECKO_ID, Number(collateral) / 10 ** WBTC_DECIMALS);
        } else {
            api.add(market.collateralTokenId, collateral);
        }
        api.add(market.loanTokenId, loanBalance);
    }
}

async function borrowed(api) {
    const markets = await getMarkets();
    for (const market of markets) {
        const state = await alephium.contractMultiCall([{
            group: 0,
            address: config.linx,
            methodIndex: MARKET_METHOD_INDEX,
            args: [{ type: "ByteVec", value: market.marketId }]
        }]);
        const borrowAssets = BigInt(state[0].returns[2].value);
        api.add(market.loanTokenId, borrowAssets);
    }
}

module.exports = {
    alephium: {
        tvl,
        borrowed
    }
};
