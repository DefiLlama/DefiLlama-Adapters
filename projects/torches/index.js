const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')
const { fixBalancesTokens, transformTokens } = require("../helper/tokenMapping");

const comptroller = "0xfbAFd34A4644DC4f7c5b2Ae150279162Eb2B0dF6"

async function getAllCTokens(block) {
  return (await sdk.api.abi.call({
    block,
    chain: 'kcc',
    target: comptroller,
    params: [],
    abi: abi['getAllMarkets'],
  })).output;
}

async function getUnderlying(block, cToken) {
  return (await sdk.api.abi.call({
      block,
      chain: 'kcc',
      target: cToken,
      abi: abi['underlying'],
    })).output
}

function transformAddress(token) {
    return transformTokens.kcc[token]
}

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(block) {
  let allCTokens = await getAllCTokens(block);
  const markets = []
  await (
    Promise.all(allCTokens.map(async (cToken) => {
      let underlying = await getUnderlying(block, cToken);
      markets.push({ underlying, cToken })
    }))
  );

  return markets;
}

function lending(borrowed) {
  return async (timestamp, ethBlock, {kcc: block}) => {
    let balances = {};
    let markets = await getMarkets(block);

    let v2Locked = await sdk.api.abi.multiCall({
      block,
      calls: markets.map((market) => ({
        target: market.cToken,
      })),
      chain: 'kcc',
      abi: borrowed ? abi.totalBorrows : abi['getCash'],
    });

    const symbols = await sdk.api.abi.multiCall({
      block,
      calls: markets.map((market) => ({
        target: market.cToken,
      })),
      chain: 'kcc',
      abi: "erc20:symbol",
    });

    const lps = []
    markets.forEach((market, idx) => {
      let getCash = v2Locked.output.find((result) => result.input.target === market.cToken);
      const symbol = symbols.output.find((result) => result.input.target === market.cToken);
      if (getCash.output === null) {
        throw new Error("getCash failed")
      }
      if (symbol.output.endsWith("LP")) {
        lps.push({
          token: market.underlying,
          balance: getCash.output
        })
      } else {
        let under=market.underlying.toLowerCase()
        const replacement = fixBalancesTokens.kcc[under]
        if (replacement === undefined) {
          sdk.util.sumSingleBalance(balances, transformAddress(under), Number(getCash.output))
        } else {
          // 10**18=1e18
          sdk.util.sumSingleBalance(balances, replacement.coingeckoId, Number(getCash.output) / 10 ** replacement.decimals)
        }
      }
    });

    await unwrapUniswapLPs(balances, lps, block, "kcc", transformAddress)
    return balances;
  }
}

module.exports = {
  timetravel: true,
  kcc: {
    tvl: lending(false),
    borrowed: lending(true)
  },
};
