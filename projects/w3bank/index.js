const abi = require("./abi.json");
const { lendingMarket } = require("../helper/methodologies");

async function getMarkets(api, markets) {
  let w3Tokens = await api.call({
    block: '',
    target: '0x697bc9fd98ddafd1979c3e079033698ca93af451',
    params: [],
    abi: abi.getAllMarkets
  });
  
  w3Tokens.map(e => {
    markets.push({w3Token: e})
  });

  return markets;
}

async function getUnderlyingToken(api, markets) {
  const underTokens = await api.multiCall({
    block: '',
    calls: markets.map(market => ({target: market.w3Token})),
    abi: abi.underlying
  });

  underTokens.forEach((v, i) => {
    markets[i]["underlying"] = v;
  });

  return markets;
}

async function getLockedValue(api, markets) {
  let locked = await api.multiCall({
    block: '',
    calls: markets.map(market => ({target: market.w3Token})),
    abi: abi.getCash
  });

  locked.forEach((v, i) => {
    markets[i]["locked"] = v;
  });

  return markets;
}

async function getBorrowedValue(api, markets) {
  let ttlBorrowed = await api.multiCall({
    block: '',
    calls: markets.map(market => ({target: market.w3Token})),
    abi: abi.totalBorrows
  });

  ttlBorrowed.forEach((v, i) => {
    markets[i]["borrowed"] = v
  });

  return markets;
}

async function tvl(timestamp, block, _, { api }) {
  let markets = [];
  markets = await getMarkets(api, markets);
  markets = await getUnderlyingToken(api, markets);
  markets = await getLockedValue(api, markets);

  markets.forEach(market => {
    api.add(market['underlying'], market['locked']);
  });
}

async function borrowed(timestamp, block, _, { api }) {
  let markets = [];
  markets = await getMarkets(api, markets);
  markets = await getUnderlyingToken(api, markets);
  markets = await getBorrowedValue(api, markets);

  markets.forEach(market => {
    api.add(market['underlying'], market['borrowed']);
  });
}

module.exports = {
  timetravel: true,
  start: 1693843200,
  pg: {
    tvl, 
    borrowed
  },
  methodology: `${lendingMarket}`,
};
