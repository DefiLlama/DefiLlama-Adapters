const sdk = require("@defillama/sdk");
const {
  getNumMarkets,
  getMarketTokenAddress,
  getMarketTotalPar,
  getMarketCurrentIndex,
  getName,
  getUnderlying
} = require("./dolomite-margin.json");
const { BigNumber } = require("@ethersproject/bignumber");

const dolomiteMargin = "0x6bd780e7fdf01d77e4d475c821f1e7ae05409072";

const contracts = [dolomiteMargin];
const ONE_ETH_IN_WEI = "1000000000000000000";

const isolationNameTest = "Dolomite Isolation:";
const siloNameTest = "Dolomite Silo:";
const glpGrandfatheredTest = "Dolomite: Fee + Staked GLP";

async function getTokensAndBalances(chain, block, supplyOrBorrow) {
  const { output: tokenCount } = await sdk.api.abi.call({
    target: contracts[0],
    abi: getNumMarkets,
    chain: chain,
    block: block,
    params: []
  });

  const tokenCalls = [];
  for (let i = 0; i < Number(tokenCount); i++) {
    tokenCalls.push({
      target: dolomiteMargin,
      params: [i]
    });
  }

  const { output: tokensResult } = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: getMarketTokenAddress,
    calls: tokenCalls
  });

  const tokens = tokensResult.map(tokenResult => tokenResult.output);

  const nameCalls = tokens.map(token => {
    return {
      target: token,
      params: []
    };
  });
  const { output: namesResult } = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: getName,
    calls: nameCalls
  });

  const tokenToUnderlyingCalls = tokens.reduce((memo, token, i) => {
    const name = namesResult[i].output;
    if (name.includes(isolationNameTest) || name.includes(siloNameTest) || name.includes(glpGrandfatheredTest)) {
      memo[token] = {
        target: token,
        params: [],
        index: Object.values(memo).length,
      };
    }
    return memo;
  }, {});

  const { output: transformedTokenAddresses } = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: getUnderlying,
    calls: Object.values(tokenToUnderlyingCalls)
  });

  for (let i = 0; i < tokens.length; i++) {
    if (tokenToUnderlyingCalls[tokens[i]]) {
      tokens[i] = transformedTokenAddresses[tokenToUnderlyingCalls[tokens[i]].index].output;
    }
  }

  const { output: totalParsResult } = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: getMarketTotalPar,
    calls: tokenCalls
  });

  const { output: indexesResult } = await sdk.api.abi.multiCall({
    chain,
    block,
    abi: getMarketCurrentIndex,
    calls: tokenCalls
  });

  const supplies = totalParsResult.map((totalParResult, i) => {
    return BigNumber.from(totalParResult.output.supply)
      .mul(indexesResult[i].output.supply)
      .div(ONE_ETH_IN_WEI)
      .toString();
  });

  const borrows = totalParsResult.map((totalParResult, i) => {
    return BigNumber.from(totalParResult.output.borrow)
      .mul(indexesResult[i].output.borrow)
      .div(ONE_ETH_IN_WEI)
      .toString();
  });

  return {
    tokens: tokens.map(token => `arbitrum:${token}`),
    balances: supplyOrBorrow === "supply" ? supplies : borrows
  };
}

async function tvl(timestamp, ethereumBlock, blocksToKeys) {
  return getSuppliesOrBorrows(timestamp, ethereumBlock, blocksToKeys, "supply");
}

async function borrowed(timestamp, ethereumBlock, blocksToKeys) {
  return getSuppliesOrBorrows(timestamp, ethereumBlock, blocksToKeys, "borrow");
}

async function getSuppliesOrBorrows(timestamp, ethereumBlock, blocksToKeys, supplyOrBorrow) {
  const chain = "arbitrum";
  const block = blocksToKeys[chain];

  const { tokens, balances } = await getTokensAndBalances(chain, block, supplyOrBorrow);

  return tokens.reduce((memo, token, i) => {
    memo[token] = balances[i];
    return memo;
  }, {});
}

module.exports = {
  start: 1664856000,  // 10/4/2022 @ 00:00am (UTC)
  arbitrum: {
    tvl,
    borrowed
  },
  hallmarks: [],
  misrepresentedTokens: true,
};
