
const sdk = require('@defillama/sdk');
const abi = require('./abis/compound.json');
const brainiacAbi = require('./abis/brainiac.json');
const { getBlock } = require('./getBlock');
const { requery } = require("./requery");
const { usdtAddress } = require('./balances');
const axios = require("axios");
const BigNumber = require('bignumber.js').default;
const { toUSDTBalances } = require('./balances');

const farms = [
  "0x8a01b508d8bF08eE5583743C9E1C8Ec45C22E303",
  "0x4bdEb91c2DA38F60bc03aB469B095300656FeAa1",
]

const LPfarms = [
  "0x1781c95EB104238DA6dfC66E2005b3Afc36BcFf9",
  "0x38254D980745027d0dB39f06f83c40BE37F03404",
  "0x355880E6b49931A7B8B950B3dc032eF19670B780",
]


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


async function getStakedTokenPrice(block, chain , isLP ) {

 const reserve =  (await sdk.api.abi.call({
    block,
    target: "0xaa0f41e50dbfd8247fb397b1fffea1fea9f4e6d4",
    params: [],
    abi: brainiacAbi.getReserves,
    chain
  })).output;

  const totalSupplyLp =  (await sdk.api.abi.call({
    block,
    target: "0xaa0f41e50dbfd8247fb397b1fffea1fea9f4e6d4",
    abi: brainiacAbi.totalSupply,
    chain
  })).output;

  // x = reserve0 / reserve1 | gives  1 token1 = x token0
  // y = reserve1 / reserve0 | gives  1 token0 = y token1
  const x = new BigNumber(reserve._reserve0).multipliedBy(1e18).div(reserve._reserve1).toNumber();
  const y = new BigNumber(reserve._reserve1).multipliedBy(1e18).div(reserve._reserve0).toNumber();

  // fetching ckb price from coingecko in usd
  const res = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=nervos-network&vs_currencies=usd");
  const ckbPrice = res.data['nervos-network'].usd;

  // brnPrice =  exchangeRate (y) * ckbPrice
  const brnPrice =  new BigNumber(y).multipliedBy(ckbPrice).div(1e18);

  // total value of brn in pool (usd)
  // valueTotalBRN =  reserve0 * brnPrice
  const valueTotalBRN = new BigNumber(reserve._reserve0).multipliedBy(brnPrice).div(1e18);

  // total value of wckb in pool (usd)
  // valueTotalBRN =  reserve1 * ckbPrice
  const valueTotalCKB = new BigNumber(reserve._reserve1).multipliedBy(ckbPrice).div(1e18);

  // lptokenPrice = [($ value total brn in lp) + ($ value total ckb in lp)]/(total supply of LPtoken)
  const lpTokenPrice = new BigNumber(valueTotalBRN).plus(valueTotalCKB).multipliedBy(1e18).div(totalSupplyLp);

  return isLP ? lpTokenPrice : brnPrice;
}

// returns [{cToken, underlying}]
async function getMarkets(comptroller, block, chain, brether, bretheEquivalent, blacklist = [], abis={}) {
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
      if (brether && cToken === brether.toLowerCase()) {
        markets.push({ underlying: "0x7538C85caE4E4673253fFd2568c1F1b48A71558a", cToken })
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

let marketsCache = {}

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

async function getUnderlyingDecimalsMultiple(block, chain, marketData, brether) {
  const response = {}
  const calls = marketData.map(i => ({ target: i.underlying }))
  const { output: decimals } = await sdk.api.abi.multiCall({
    calls,
    abi: "erc20:decimals",
    block,
    chain,
  })

  decimals.forEach(({ output}, i) => {
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

async function getFarmTotalSuppliesMultiple(block, chain, tokens) {
  const calls = tokens.map(t => ({ target: t }))
  const { output: cash } = await sdk.api.abi.multiCall({
    calls,
    abi: brainiacAbi.totalSupplies,
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


function getCompoundUsdTvl(comptroller, chain, brether, borrowed,includeFarms,  abis = {
  oracle: abi['oracle'],
  underlyingPrice: abi['getUnderlyingPrice'],
  getAllMarkets: abi['getAllMarkets']
}, {
  blacklist = [],
} = {}) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    let tvl = new BigNumber('0');
    blacklist = blacklist.map(i => i.toLowerCase())
    const marketData = await getMarkets(comptroller, block, chain, brether, undefined, blacklist, abis)
    let allMarkets = marketData.map(i => i.cToken);
    // allMarkets = allMarkets.filter(token => !blacklist.includes(token.toLowerCase())) // taken care of by getMarkets

    let oracle = await getOracle(block, chain, comptroller, abis.oracle);

    // gets data for allMarkets in one call
    const amounts = await getCashMultiple(block, chain, allMarkets, borrowed)
    const decimalsAll = await getUnderlyingDecimalsMultiple(block, chain, marketData, brether)
    const underlyingPrices = await getUnderlyingPriceMultiple(block, chain, oracle, allMarkets, abis.underlyingPrice)

    allMarkets.forEach(token => {
      let amount = new BigNumber(amounts[token]);
      let decimals = decimalsAll[token];
      let locked = amount.div(10 ** decimals);
      // brainiacPriceOracle returns 1e18 mantissa prices
      let underlyingPrice = new BigNumber(underlyingPrices[token]).div(10 **  18)
      tvl = tvl.plus(locked.times(underlyingPrice));
    })

    if (includeFarms) {

      const amounts = await getFarmTotalSuppliesMultiple(block, chain, farms);
      const amountsLP = await getFarmTotalSuppliesMultiple(block, chain, LPfarms);
      const brnPriceUsd = await getStakedTokenPrice(block, chain, false);
      const lpTokenPriceUsd = await getStakedTokenPrice(block, chain, true);

      // sum up tvl for farm and lpFarms
      farms.forEach(token => {
        let amount = new BigNumber(amounts[token]);
        let decimals = 18;
        let locked = amount.div(10 ** decimals);
        tvl = tvl.plus(locked.times(brnPriceUsd));
      })

      LPfarms.forEach(token => {
        let amount = new BigNumber(amountsLP[token]);
        let decimals = 18;
        let locked = amount.div(10 ** decimals);
        tvl = tvl.plus(locked.times(lpTokenPriceUsd));
      })
    }

    return toUSDTBalances(tvl.toNumber());
  }
}


function getFarmUsdTvl(chain,{ blacklist = [], } = {}) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks, true);
    let tvl = new BigNumber('0');

    const amounts = await getFarmTotalSuppliesMultiple(block, chain, farms);
    const amountsLP = await getFarmTotalSuppliesMultiple(block, chain, LPfarms);
    const brnPriceUsd = await getStakedTokenPrice(block, chain, false);
    const lpTokenPriceUsd = await getStakedTokenPrice(block, chain, true);

    farms.forEach(token => {
      let amount = new BigNumber(amounts[token]);
      let decimals = 18;
      let locked = amount.div(10 ** decimals);
      tvl = tvl.plus(locked.times(brnPriceUsd));
    })

    LPfarms.forEach(token => {
      let amount = new BigNumber(amountsLP[token]);
      let decimals = 18;
      let locked = amount.div(10 ** decimals);
      tvl = tvl.plus(locked.times(lpTokenPriceUsd));
    })

    return toUSDTBalances(tvl.toNumber());
  }
}


function fullCoumpoundExports(comptroller, chain, brether, bretheEquivalent) {
  return {
    timetravel: true,
    doublecounted: false,
    [chain]: usdCompoundExports(comptroller, chain, brether,)
  }
}

function usdCompoundExports(comptroller, chain, brether, abis, options = {}) {
  return {
    // getCompoundUsdTvl(comptroller, chain, brether, borrowed,includeFarms, abis ,options,)
    tvl: getCompoundUsdTvl(comptroller, chain, brether, false,true ,abis, options,),
    borrowed: getCompoundUsdTvl(comptroller, chain, brether, true, false, abis, options,),
    staking : getFarmUsdTvl(chain, options,)
  }
}

module.exports = {
  getCompoundUsdTvl,
  fullCoumpoundExports,
  usdCompoundExports,
};
