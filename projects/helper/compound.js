const ADDRESSES = require('./coreAssets.json')

const sdk = require('@defillama/sdk');
const abi = require('./abis/compound.json');
const { unwrapUniswapLPs } = require('./unwrapLPs');
const { requery } = require("./requery");
const { getChainTransform, transformBalances } = require('./portedTokens');
const { usdtAddress } = require('./balances');
const agoraAbi = require("./../agora/abi.json");
const { sumTokens2, nullAddress, unwrapLPsAuto, } = require('./unwrapLPs')
const methodologies = require('./methodologies');

// ask comptroller for all markets array
async function getAllCTokens(comptroller, block, chain, allMarketsAbi = abi['getAllMarkets']) {
  return (await sdk.api.abi.call({
    block,
    target: comptroller,
    params: [],
    abi: allMarketsAbi,
    chain
  })).output;
}

// returns [{cToken, underlying}]
async function getMarkets(comptroller, block, chain, cether, cetheEquivalent, blacklist = [], abis = {}) {
  const marketKey = `${chain}:${comptroller}:${block}`

  if (!marketsCache[marketKey]) marketsCache[marketKey] = _getMarkets()
  return marketsCache[marketKey]

  async function _getMarkets() {
    let allCTokens = await getAllCTokens(comptroller, block, chain, abis.getAllMarkets);
    const markets = []
    const calls = []
    allCTokens.forEach(cToken => {
      cToken = cToken.toLowerCase()
      if (blacklist.includes(cToken)) return;
      if (cether && (cToken === cether.toLowerCase?.() || cether.includes(cToken))) {
        markets.push({ underlying: cetheEquivalent, cToken })
        return;
      }
      if (cToken === '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'.toLowerCase()) {
        markets.push({ underlying: ADDRESSES.ethereum.WETH, cToken })  //cETH => WETH
        return;
      }
      if (cToken === '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c'.toLowerCase() && chain === 'avax') {
        markets.push({ underlying: ADDRESSES.avax.WAVAX, cToken })
        return;
      }
      if (['0xd2ec53e8dd00d204d3d9313af5474eb9f5188ef6', '0x0aeadb9d4c6a80462a47e87e76e487fa8b9a37d7'].includes(cToken) && chain === 'rsk') {
        markets.push({ underlying: ADDRESSES.rsk.WRBTC1, cToken })
        return;
      }

      calls.push({ target: cToken })
    })

    const underlyings = await sdk.api.abi.multiCall({
      abi: abi['underlying'],
      calls,
      chain, block,
    })

    await requery(underlyings, chain, block, abi)

    const isCeth = underlyings.output.find(i => !i.output)
    if (isCeth)
      throw new Error(`${isCeth.input.target} market rugged, is that market CETH?`)

    underlyings.output.forEach(({ output, input: { target } }) => markets.push({ cToken: target, underlying: output }))

    return markets;
  }
}
async function unwrapPuffTokens(balances, lpPositions, block) {
  const pricePerShare = (await sdk.api.abi.multiCall({
    block,
    abi: agoraAbi.getPricePerFullShare,
    calls: lpPositions.map(p => ({
      target: p.token
    })),
    chain: 'metis'
  })).output;
  const underlying = (await sdk.api.abi.multiCall({
    block,
    abi: agoraAbi.want,
    calls: lpPositions.map(p => ({
      target: p.token
    })),
    chain: 'metis'
  })).output;

  const newLpPositions = [];
  for (let i = 0; i < lpPositions.length; i++) {
    newLpPositions.push({ balance: lpPositions[i].balance * pricePerShare[i].output / 10 ** 18, token: underlying[i].output })
  }

  await unwrapUniswapLPs(
    balances,
    newLpPositions,
    block,
    'metis'
  );
}

let marketsCache = {}

function getCompoundV2Tvl(comptroller, chain, transformAdress,
  cether = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", cetheEquivalent = ADDRESSES.ethereum.WETH,
  borrowed = false, checkForLPTokens = undefined,
  {
    fetchBalances = false,
    blacklistedTokens = [],
    abis = {},
    resolveLPs = true,
  } = {}) {
  abis = { ...abi, ...abis }
  blacklistedTokens = blacklistedTokens.map(i => i.toLowerCase())
  return async (api) => {
    if (!api) {
      api = new sdk.ChainApi({ chain, })
    }
    chain = api.chain
    const block = api.block
    if (!transformAdress) transformAdress = await getChainTransform(chain)
    let balances = {};
    let markets = await getMarkets(comptroller, block, chain, cether, cetheEquivalent, blacklistedTokens, abis)
    if (!borrowed && fetchBalances) {
      return sumTokens2({ api, tokensAndOwners: markets.map(i => [i.underlying, i.cToken]), blacklistedTokens, })
    }
    const cTokenCalls = markets.map(market => ({
      target: market.cToken,
    }))
    // Get V2 tokens locked
    let v2Locked = await sdk.api.abi.multiCall({
      block,
      chain,
      calls: cTokenCalls,
      abi: borrowed ? abis.totalBorrows : abis.getCash,
    });

    let symbols;
    if (checkForLPTokens !== undefined) {
      symbols = await sdk.api.abi.multiCall({
        block,
        chain,
        calls: cTokenCalls,
        abi: "erc20:symbol",
      });
    }

    const lpPositions = []
    markets.forEach((market, idx) => {
      const underlying = market.underlying.toLowerCase()
      if (blacklistedTokens.includes(underlying)) return;
      let getCash = v2Locked.output.find((result) => result.input.target === market.cToken);
      if (checkForLPTokens !== undefined && checkForLPTokens(symbols.output[idx].output)) {
        lpPositions.push({
          token: underlying,
          balance: getCash.output
        })
      } else {
        sdk.util.sumSingleBalance(balances, transformAdress(underlying), getCash.output)
      }
    });

    if (comptroller == "0x92DcecEaF4c0fDA373899FEea00032E8E8Da58Da") {
      await unwrapPuffTokens(balances, lpPositions, block)
    } else if (lpPositions.length > 0) {
      await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAdress)
    }

    if (resolveLPs) await unwrapLPsAuto({ balances, block, chain, abis})

    return transformBalances(chain, balances);
  }
}

const BigNumber = require('bignumber.js').default;
const { toUSDTBalances } = require('./balances');

// ask comptroller for oracle
async function getOracle(block, chain, comptroller, oracleAbi) {
  const { output: oracle } = await sdk.api.abi.call({
    target: comptroller,
    abi: oracleAbi,
    block,
    chain: chain,
  });
  return oracle;
}

async function getUnderlyingDecimalsMultiple(block, chain, marketData, cether) {
  marketData = marketData.filter(i => i.underlying)
  const response = {}
  const calls = marketData.map(i => ({ target: i.underlying }))
  const { output: decimals } = await sdk.api.abi.multiCall({
    calls,
    abi: "erc20:decimals",
    block,
    chain,
    permitFailure: true,
  })

  decimals.forEach(({ output }, i) => {
    if (output !== null)
      response[marketData[i].cToken] = output
  })

  return response
}

async function getCashMultiple(block, chain, tokens, borrowed) {
  const calls = tokens.map(t => ({ target: t }))
  const { output: cash } = await sdk.api.abi.multiCall({
    calls,
    abi: borrowed ? abi.totalBorrows : abi['getCash'],
    block,
    chain,
  });
  const response = {}
  cash.forEach(({ input, output }) => response[input.target] = output)
  return response;
}

async function getUnderlyingPriceMultiple(block, chain, oracle, tokens, methodAbi) {
  const calls = tokens.map(t => ({ params: [t] }))
  const { output: underlyingPrice } = await sdk.api.abi.multiCall({
    target: oracle,
    abi: methodAbi,
    block,
    chain,
    calls,
  });
  const response = {}
  underlyingPrice.forEach(({ input, output }) => response[input.params[0]] = output)
  return response;
}


function getCompoundUsdTvl(comptroller, chain, cether, borrowed, abis = {
  oracle: abi['oracle'],
  underlyingPrice: abi['getUnderlyingPrice'],
  getAllMarkets: abi['getAllMarkets']
}, {
  blacklist = [],
  cetheEquivalent = undefined,
} = {}) {
  return async (timestamp, ethBlock, { [chain]: block }) => {
    let tvl = new BigNumber('0');
    blacklist = blacklist.map(i => i.toLowerCase())
    const marketData = await getMarkets(comptroller, block, chain, cether, cetheEquivalent, blacklist, abis)
    let allMarkets = marketData.map(i => i.cToken);
    // allMarkets = allMarkets.filter(token => !blacklist.includes(token.toLowerCase())) // taken care of by getMarkets
    let oracle = await getOracle(block, chain, comptroller, abis.oracle);
    const amounts = await getCashMultiple(block, chain, allMarkets, borrowed)
    const decimalsAll = await getUnderlyingDecimalsMultiple(block, chain, marketData, cether)
    const underlyingPrices = await getUnderlyingPriceMultiple(block, chain, oracle, allMarkets, abis.underlyingPrice)

    allMarkets.forEach(token => {
      let amount = new BigNumber(amounts[token]);
      let decimals = decimalsAll[token] ?? 0;
      let locked = amount.div(10 ** decimals);
      let underlyingPrice = new BigNumber(underlyingPrices[token]).div(10 ** (18 + 18 - decimals))
      tvl = tvl.plus(locked.times(underlyingPrice));
    })
    return toUSDTBalances(tvl.toNumber());
  }
}

function compoundExports(comptroller, chain, cether, cetheEquivalent, transformAdressRaw, checkForLPTokens, { blacklistedTokens = [], fetchBalances, abis = {}, resolveLPs=true } = {}) {
  if (cether !== undefined && cetheEquivalent === undefined) {
    throw new Error("You need to define the underlying for native cAsset")
  }
  return {
    tvl: getCompoundV2Tvl(comptroller, chain, transformAdressRaw, cether, cetheEquivalent, false, checkForLPTokens, { blacklistedTokens, fetchBalances, abis, resolveLPs }),
    borrowed: getCompoundV2Tvl(comptroller, chain, transformAdressRaw, cether, cetheEquivalent, true, checkForLPTokens, { blacklistedTokens, fetchBalances, abis, resolveLPs })
  }
}

function compoundExportsWithAsyncTransform(comptroller, chain, cether, cetheEquivalent, options) {
  return {
    tvl: async (...args) => {
      const transformAddress = await getChainTransform(chain)
      return getCompoundV2Tvl(comptroller, chain, transformAddress, cether, cetheEquivalent, false, undefined, options)(...args)
    },
    borrowed: async (...args) => {
      const transformAddress = await getChainTransform(chain)
      return getCompoundV2Tvl(comptroller, chain, transformAddress, cether, cetheEquivalent, true, undefined, options)(...args)
    },
  }
}

function fullCoumpoundExports(comptroller, chain, cether, cetheEquivalent, transformAdress) {
  return {
            [chain]: compoundExports(comptroller, chain, cether, cetheEquivalent, transformAdress)
  }
}

function usdCompoundExports(comptroller, chain, cether, abis, options = {}) {
  return {
    tvl: getCompoundUsdTvl(comptroller, chain, cether, false, abis, options,),
    borrowed: getCompoundUsdTvl(comptroller, chain, cether, true, abis, options,)
  }
}

function compoundExportsWithDifferentBase(comptroller, chain, token) {
  const raw = usdCompoundExports(comptroller, chain)
  async function tvl(...params) {
    const tvl = await raw.tvl(...params)
    return {
      [token]: Number(tvl[usdtAddress]) / 1e6
    }
  }

  async function borrowed(...params) {
    const tvl = await raw.borrowed(...params)
    return {
      [token]: Number(tvl[usdtAddress]) / 1e6
    }
  }
  return {
    tvl,
    borrowed
  }
}

function compoundExports2({ comptroller, chain, cether, cetheEquivalent = nullAddress, transformAdressRaw, checkForLPTokens, blacklistedTokens = [], fetchBalances = true, abis = {} }) {
  return compoundExports(comptroller, chain, cether, cetheEquivalent, transformAdressRaw, checkForLPTokens, { blacklistedTokens, fetchBalances, abis, })
}

module.exports = {
  methodology: methodologies.lendingMarket,
  getCompoundV2Tvl,
  compoundExports,
  compoundExports2,
  getCompoundUsdTvl,
  compoundExportsWithAsyncTransform,
  fullCoumpoundExports,
  usdCompoundExports,
  compoundExportsWithDifferentBase
};
