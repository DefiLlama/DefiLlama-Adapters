const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require("bignumber.js");
const { chains, ADDRESS_ZERO } = require("./constants");

const bytes32ToAddress = (bytes32Address) => "0x" + bytes32Address.substr(-40);

async function getTokens(target, method, chain, block) {
  return sdk.api.abi.call({
    target: chains[chain][target],
    abi: abi[method],
    chain,
    block
  }).then(response => response.output.map(bytes32ToAddress));
}

async function getLendables(chain, block) {
  return getTokens("reserveFactory", "getAllLendables", chain, block);
}

async function getShortables(chain, block) {
  return getTokens("pairFactory", "getAllShortables", chain, block);
}

async function getProxyLendables(chain, block) {
  return getTokens("pairFactory", "getAllProxyLendables", chain, block);
}

async function getTradables(chain, block) {
  return getTokens("pairFactory", "getAllTradables", chain, block);
}

async function getLiquidity(data, chain, block) {
  const calls = Object.entries(data)
    .filter(([, holder]) => holder !== ADDRESS_ZERO)
    .map(([token, holder]) => ({ target: token, params: holder }));

  return sdk.api.abi.multiCall({
    calls,
    abi: "erc20:balanceOf",
    chain,
    block
  })
    .then(response => response.output.map(({ input, output }) => [input.target, output]))
    .then(Object.fromEntries);
}

async function getStakedLiquidity(chain, block) {
  if (chains[chain].WOWLP === ADDRESSES.null) {
    const stakedLiquidity = await getLiquidity(
        { [chains[chain].WOW]: chains[chain].xWOW },
        chain,
        block);

    const WOWBalance = stakedLiquidity[chains[chain].WOW]
    return {[chains[chain].WOW]: WOWBalance}
  }

  const stakedLiquidity = await getLiquidity(
    { [chains[chain].WOW]: chains[chain].xWOW, [chains[chain].WOWLP]: chains[chain].xWOW },
    chain,
    block);

  const lpTotalSupply = (await sdk.api.abi.call({
    target: chains[chain].WOWLP,
    abi: "erc20:totalSupply",
    chain,
    block
  })).output;

  const { _reserve0: reserve0, _reserve1: reserve1 } = (await sdk.api.abi.call({
    target: chains[chain].WOWLP,
    abi: abi.getReserves,
    chain,
    block
  })).output;

  const token0 = (await sdk.api.abi.call({ target: chains[chain].WOWLP, abi: abi.token0, chain, block })).output;
  const token1 = (await sdk.api.abi.call({ target: chains[chain].WOWLP, abi: abi.token1, chain, block })).output;
  const part = new BigNumber(stakedLiquidity[chains[chain].WOWLP]).div(lpTotalSupply);

  const WOWBalance = stakedLiquidity[chains[chain].WOW]
  const token0Balance = (new BigNumber(reserve0)).multipliedBy(part)
  const token1Balance = (new BigNumber(reserve1)).multipliedBy(part)

  if(token0.toLowerCase() === chains[chain].WOW.toLowerCase()) {
    return {
      [token0]: BigNumber.sum(WOWBalance, token0Balance),
      [token1]: token1Balance
    }
  } else {
    return {
      [token0]: token0Balance,
      [token1]: BigNumber.sum(WOWBalance, token1Balance)
    }
  }
}

async function getReserves(tokens, chain, block) {
  const calls = tokens.map(token => ({ target: chains[chain].reserveFactory, params: token }));
  return sdk.api.abi.multiCall({
    calls,
    abi: abi.getReserve,
    chain,
    block
  })
    .then(response => response.output.map(({ input, output }) => [input.params[0], output]))
    .then(Object.fromEntries);
}

async function getPairs(lendables, tradables, chain, block) {
  const tokens = lendables.flatMap(
    lendable => tradables.map(
      tradable => ([lendable, tradable])
    )
  );
  const calls = tokens.map(params => ({ target: chains[chain].pairFactory, params: params }));
  return sdk.api.abi.multiCall({
    calls,
    abi: abi.getPair,
    chain,
    block
  })
    .then(response => response.output.map(({ input, output }) => [input.params[1], output]))
    .then(Object.fromEntries);
}

async function getShortingPairs(lendables, shortables, chain, block) {
  const tokens = lendables.flatMap(
    lendable => shortables.map(
      shortable => ([lendable, shortable])
    )
  );
  const calls = tokens.map(params => ({ target: chains[chain].pairFactory, params: params }));
  return sdk.api.abi.multiCall({
    calls,
    abi: abi.getShortingPair,
    chain,
    block
  })
    .then(response => response.output.map(({ input, output }) => [input.params[0], output]))
    .then(Object.fromEntries);
}

async function getRoutablePairs(lendables, proxies, tradables, chain, block) {
  const tokens = lendables.flatMap(
    lendable => proxies.flatMap(
      proxy => tradables.map(
        tradable => ([lendable, proxy, tradable])
      )
    )
  );
  const calls = tokens.map(params => ({ target: chains[chain].pairFactory, params }));
  return sdk.api.abi.multiCall({
    calls,
    abi: abi.getRoutablePair,
    chain,
    block
  })
    .then(response => response.output.map(({ input, output }) => [input.params[2], output]))
    .then(Object.fromEntries);
}

async function getRoutableShortingPairs(lendables, proxies, shortables, chain, block) {
  const tokens = lendables.flatMap(
    lendable => proxies.flatMap(
      proxy => shortables.map(
        shortable => ([lendable, proxy, shortable])
      )
    )
  );
  const calls = tokens.map(params => ({ target: chains[chain].pairFactory, params }));
  return sdk.api.abi.multiCall({
    calls,
    abi: abi.getRoutableShortingPair,
    chain,
    block
  })
    .then(response => response.output.map(({ input, output }) => [input.params[0], output]))
    .then(Object.fromEntries);
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
  getLiquidity,
  getStakedLiquidity
};

