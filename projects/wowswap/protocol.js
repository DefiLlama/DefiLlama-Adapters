const abi = require("./abi.json");
const { chains, } = require("./constants");

const bytes32ToAddress = (bytes32Address) => "0x" + bytes32Address.substr(-40);

async function getTokens(target, method, api) {
  return api.call({
    target: chains[api.chain][target],
    abi: abi[method],
  }).then(response => response.map(bytes32ToAddress));
}

async function getLendables(api) {
  return getTokens("reserveFactory", "getAllLendables", api);
}

async function getShortables(api) {
  return getTokens("pairFactory", "getAllShortables", api);
}

async function getProxyLendables(api) {
  return getTokens("pairFactory", "getAllProxyLendables", api);
}

async function getTradables(api) {
  return getTokens("pairFactory", "getAllTradables", api);
}

async function getReserves(tokens, api) {
  return api.multiCall({
    target: chains[api.chain].reserveFactory,
    calls: tokens,
    abi: abi.getReserve,
  }).then(response => response.map((v, i) => [tokens[i], v]))
}

async function getPairs(lendables, tradables, api) {
  const tokens = lendables.flatMap(lendable => tradables.map(tradable => ([lendable, tradable])));
  const calls = tokens.map(params => ({ params }));
  return api.multiCall({
    target: chains[api.chain].pairFactory,
    calls,
    abi: abi.getPair,
  })
    .then(response => response.map((v, i) => [calls[i].params[1], v]))
}

async function getShortingPairs(lendables, shortables, api) {
  const tokens = lendables.flatMap(lendable => shortables.map(shortable => ([lendable, shortable])));
  const calls = tokens.map(params => ({ target: chains[api.chain].pairFactory, params: params }));
  return api.multiCall({
    calls,
    abi: abi.getShortingPair,
  })
    .then(response => response.map((v, i) => [calls[i].params[0], v]))
}

async function getRoutablePairs(lendables, proxies, tradables, api) {
  const tokens = lendables.flatMap(
    lendable => proxies.flatMap(
      proxy => tradables.map(
        tradable => ([lendable, proxy, tradable])
      )
    )
  );
  const calls = tokens.map(params => ({ target: chains[api.chain].pairFactory, params }));
  return api.multiCall({
    calls,
    abi: abi.getRoutablePair,
  })
    .then(response => response.map((v, i) => [calls[i].params[2], v]))
}

async function getRoutableShortingPairs(lendables, proxies, shortables, api) {
  const tokens = lendables.flatMap(
    lendable => proxies.flatMap(
      proxy => shortables.map(
        shortable => ([lendable, proxy, shortable])
      )
    )
  );
  const calls = tokens.map(params => ({ target: chains[api.chain].pairFactory, params }));
  return api.multiCall({
    calls,
    abi: abi.getRoutableShortingPair,
  })
    .then(response => response.map((v, i) => [calls[i].params[0], v]))
}

module.exports = {
  getReserves,
  getPairs,
  getRoutablePairs,
  getShortingPairs,
  getRoutableShortingPairs,
  getLendables,
  getTradables,
  getShortables,
  getProxyLendables,
};

