const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");
const getReserves = require('../helper/abis/getReserves.json');
const { ETF_ABI, ETF_ORACLE_ABI } = require('./abi');
// const { staking, sumTokensExport } = require('../helper/unknownTokens')

const { staking, stakingUnknownPricedLP } = require("../helper/staking");

/**
 * farms +
 * liquidity
 * etf
 * regulation staking
 */

const REGULATION_STAKING_POOL = '0xd69dB827939e26511068AA2bf742E7463b292190'
const FARM = '0xCC180BfA5d2C3Ac191758B721C9bBbB263b3fd1C'

const ETF_INDEX_POOL = '0x60EBfD605Cb25C7796F729c78a4453ACeCb1CE03'
const ETF_ORACLE = '0x3B186d534c714679cf9d0504D1FBFD56c2339E7C'

const TOKENS = {
  USDEX_USDC_LP: '0x79F3bb5534b8f060b37b3e5deA032a39412F6B10',
  DEXSHARE_BNB_LP: '0x65D83463fC023bffbd8aC9a1a2E1037F4bbdB399',
  DEXSHARE: '0xf4914E6D97a75f014AcFcF4072f11be5CfFc4cA6',
  DEXIRA: '0x147e07976e1ae78287c33aafaab87760d32e50a5',
  WDEX_DEXSHARE: '0x6647047433df4CFc9912d092Fd155b9d972A4a85',
  BNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
};


async function getWdexDexsharePrice(dexIraPrice, dexSharePrice) {
  const commonOptions = {
    chain: 'bsc',
    decimals: 18
  }
  const [
    { output: wdexTotalSupply },
    { output: balanceDexIra },
    { output: balanceDexShare },
  ] = await Promise.all([
    sdk.api.erc20.totalSupply({
      target: TOKENS.WDEX_DEXSHARE,
      owner: FARM,
      ...commonOptions
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.DEXIRA,
      owner: TOKENS.WDEX_DEXSHARE,
      ...commonOptions,
      decimals: 9
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.DEXSHARE,
      owner: TOKENS.WDEX_DEXSHARE,
      chain: 'bsc',
      decimals: 18
    })
  ])

  const balanceDexIraInUsd = dexIraPrice * balanceDexIra;
  const balanceDexShareInUsd = dexSharePrice * balanceDexShare;

  return (balanceDexIraInUsd + balanceDexShareInUsd) / wdexTotalSupply;
}
async function getTokenPrices() {
  // add transformtoken
  const allTokens = Object.values(TOKENS)
    .reduce((a, b) => `${a},${`bsc:${b}`}`, '');

  const { coins } = (await fetchURL("https://coins.llama.fi/prices/current/" + allTokens)).data;

  const pricesMap = Object.entries(TOKENS).reduce((a, [symbol, address]) => {
    // change key  to transformed address
    const priceObj = coins[`bsc:${address}`];
    if (!priceObj) {
      return a
    }
    return { ...a, [symbol]: priceObj.price }
  }, {})

  const wdexDexsharePrice = await getWdexDexsharePrice(pricesMap['DEXIRA'], pricesMap['DEXSHARE'])

  pricesMap['WDEX_DEXSHARE'] = wdexDexsharePrice
  return pricesMap;
};

async function farmsTvl(tokenPrices) {
  let tvl = 0
  const commonOptions = {
    chain: 'bsc',
    decimals: 18
  }
  const [
    { output: USDEX_USDC_LPFarmBalance },
    { output: DEXSHARE_BNB_LPFarmBalance },
    { output: WDEX_DEXSHAREFarmBalance },
  ] = await Promise.all([
    sdk.api.erc20.balanceOf({
      target: TOKENS.USDEX_USDC_LP,
      owner: FARM,
      ...commonOptions,
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.DEXSHARE_BNB_LP,
      owner: FARM,
      ...commonOptions,
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.WDEX_DEXSHARE,
      owner: FARM,
      ...commonOptions,
    }),
  ])
  tvl += USDEX_USDC_LPFarmBalance * tokenPrices['USDEX_USDC_LP']
  tvl += DEXSHARE_BNB_LPFarmBalance * tokenPrices['DEXSHARE_BNB_LP']
  tvl += WDEX_DEXSHAREFarmBalance * tokenPrices['WDEX_DEXSHARE']
  return tvl
};

async function dexEtfTvl(bnbPrice) {
  const { output: tokenAddresses } = await sdk.api.abi.call({
    target: ETF_INDEX_POOL,
    abi: ETF_ABI['getCurrentTokens'],
    chain: 'bsc',
    params: []
  })
  const tokensBalanceWeight = (await sdk.api.abi.multiCall({
    abi: ETF_ABI['getBalance'],
    calls: tokenAddresses.map(ta => ({ target: ETF_INDEX_POOL, params: [ta] })),
    chain: 'bsc',
  })).output.map(({ output }) => output)

  const decimals = (await Promise.all(tokenAddresses.map((ta) => sdk.api.abi.call({
    target: ta,
    abi: 'erc20:decimals',
    chain: 'bsc',
  })))).map(({ output }) => output)

  const tokenPrices = (await sdk.api.abi.call({
    target: ETF_ORACLE,
    abi: ETF_ORACLE_ABI['computeAverageTokenPrices'],
    chain: 'bsc',
    params: [tokenAddresses, '1', '172800']
  })).output.map(([price]) => price)

  const tvl = tokenPrices.reduce((acc, tokenPrice, index) => {
    const balance = tokensBalanceWeight[index];
    const decimalsNum = Number(decimals[index]);
    const tokenPriceInBnb = new BigNumber(tokenPrice).div(2 ** 112).div(10 ** (18 - decimalsNum));
    const tokenBnbValue = new BigNumber(balance).div(10 ** decimalsNum).times(tokenPriceInBnb);
    return acc.plus(tokenBnbValue.times(bnbPrice));
  }, new BigNumber(0));

  return Number(tvl.toFixed(0))
}

async function fetch() {
  const priceMap = await getTokenPrices()
  console.log('~ priceMap', priceMap);

  const [etfTvlUsd, farmsTvlUsd] = await Promise.all([
    dexEtfTvl(priceMap['BNB']),
    farmsTvl(priceMap)
  ])
  console.log('~ priceM', priceMap['BNB']);
  return etfTvlUsd + farmsTvlUsd
}

module.exports = {
  // tvl: async () => ({}),
  // // pool2: sumTokensExport({
  // //   chain: 'bsc',
  // //   // useDefaultCoreAssets: true,
  // //   owners: [FARM],
  // //   tokens: [TOKENS.DEXSHARE_BNB_LP, TOKENS.USDEX_USDC_LP, TOKENS.WDEX_DEXSHARE]
  // // }),
  // staking: staking({
  //   chain: 'bsc',
  //   // useDefaultCoreAssets: true,
  //   owners: [FARM],
  //   tokens: [TOKENS.WDEX_DEXSHARE]
  // }),
  fetch: fetch
};