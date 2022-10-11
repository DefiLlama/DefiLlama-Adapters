const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");
const { ETF_ABI, ETF_ORACLE_ABI } = require('./abi');
const { getChainTransform } = require('../helper/portedTokens');

const REGULATION_STAKING_POOL = '0xd69db827939e26511068aa2bf742e7463b292190'
const FARM = '0xcc180bfa5d2c3ac191758b721c9bbbb263b3fd1c'

const ETF_INDEX_POOL = '0x60ebfd605cb25c7796f729c78a4453acecb1ce03'
const ETF_ORACLE = '0x3b186d534c714679cf9d0504d1fbfd56c2339e7c'

const TOKENS = {
  USDEX_USDC_LP: '0x79f3bb5534b8f060b37b3e5dea032a39412f6b10',
  DEXSHARE_BNB_LP: '0x65d83463fc023bffbd8ac9a1a2e1037f4bbdb399',
  DEXIRA_BNB_LP: '0x01b279a06f5f26bd3f469a3e730097184973fc8a',
  DEXSHARE: '0xf4914e6d97a75f014acfcf4072f11be5cffc4ca6',
  DEXIRA: '0x147e07976e1ae78287c33aafaab87760d32e50a5',
  WDEX_DEXSHARE: '0x6647047433df4cfc9912d092fd155b9d972a4a85',
  BNB: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
};

const commonCallOptions = {
  chain: 'bsc',
  decimals: 18
}

const tokenPrices = {}

async function getWdexDexsharePrice(dexIraPrice, dexSharePrice) {
  const [
    { output: wdexTotalSupply },
    { output: balanceDexIra },
    { output: balanceDexShare },
  ] = await Promise.all([
    sdk.api.erc20.totalSupply({
      target: TOKENS.WDEX_DEXSHARE,
      owner: FARM,
      ...commonCallOptions
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.DEXIRA,
      owner: TOKENS.WDEX_DEXSHARE,
      ...commonCallOptions,
      decimals: 9
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.DEXSHARE,
      owner: TOKENS.WDEX_DEXSHARE,
      ...commonCallOptions
    })
  ])

  const balanceDexIraInUsd = dexIraPrice * balanceDexIra;
  const balanceDexShareInUsd = dexSharePrice * balanceDexShare;

  return (balanceDexIraInUsd + balanceDexShareInUsd) / wdexTotalSupply;
}
async function getTokenPrices(transformAddress) {
  const allTokens = Object.values(TOKENS)
    .reduce((a, b) => `${a},${transformAddress(b)}`, '');

  const { coins } = (await fetchURL("https://coins.llama.fi/prices/current/" + allTokens)).data;

  Object.values(TOKENS).forEach((address) => {
    const priceObj = coins[transformAddress(address.toLowerCase())];
    if (!priceObj) { return }
    tokenPrices[address] = priceObj.price
  }, {})

  const wdexDexsharePrice = await getWdexDexsharePrice(tokenPrices[TOKENS.DEXIRA], tokenPrices[TOKENS.DEXSHARE])

  tokenPrices[TOKENS.WDEX_DEXSHARE] = wdexDexsharePrice
};

async function regulationPoolTvl() {

  const { output: dexShareBalance } = await sdk.api.erc20.balanceOf({
    target: TOKENS.DEXSHARE,
    owner: REGULATION_STAKING_POOL,
    ...commonCallOptions,
  })
  return dexShareBalance * tokenPrices[TOKENS.DEXSHARE]
};

async function farmsTvl() {
  let tvl = 0
  const [
    { output: USDEX_USDC_LPFarmBalance },
    { output: DEXSHARE_BNB_LPFarmBalance },
    { output: WDEX_DEXSHAREFarmBalance },
  ] = await Promise.all([
    sdk.api.erc20.balanceOf({
      target: TOKENS.USDEX_USDC_LP,
      owner: FARM,
      ...commonCallOptions,
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.DEXSHARE_BNB_LP,
      owner: FARM,
      ...commonCallOptions,
    }),
    sdk.api.erc20.balanceOf({
      target: TOKENS.WDEX_DEXSHARE,
      owner: FARM,
      ...commonCallOptions,
    }),
  ])
  tvl += USDEX_USDC_LPFarmBalance * tokenPrices[TOKENS.USDEX_USDC_LP]
  tvl += DEXSHARE_BNB_LPFarmBalance * tokenPrices[TOKENS.DEXSHARE_BNB_LP]
  tvl += WDEX_DEXSHAREFarmBalance * tokenPrices[TOKENS.WDEX_DEXSHARE]
  return tvl
};

async function dexEtfTvl() {
  const bnbPrice = tokenPrices[TOKENS.BNB]
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

  const decimals = (await Promise.all(
    tokenAddresses.map((ta) => sdk.api.abi.call({
      target: ta,
      abi: 'erc20:decimals',
      chain: 'bsc',
    })))
  ).map(({ output }) => output)

  const tokenPricesOracle = (await sdk.api.abi.call({
    target: ETF_ORACLE,
    abi: ETF_ORACLE_ABI['computeAverageTokenPrices'],
    chain: 'bsc',
    params: [tokenAddresses, '1', '172800']
  })).output.map(([price]) => price)

  const tvl = tokenPricesOracle.reduce((acc, tokenPrice, index) => {
    const balance = tokensBalanceWeight[index];
    const decimalsNum = Number(decimals[index]);
    const tokenPriceInBnb = new BigNumber(tokenPrice).div(2 ** 112).div(10 ** (18 - decimalsNum));
    const tokenBnbValue = new BigNumber(balance).div(10 ** decimalsNum).times(tokenPriceInBnb);
    return acc.plus(tokenBnbValue.times(bnbPrice));
  }, new BigNumber(0));

  return Number(tvl.toFixed(0))
}

async function lpPairsTvl() {
  const lps = [
    TOKENS.DEXIRA_BNB_LP,
    TOKENS.DEXSHARE_BNB_LP,
    TOKENS.USDEX_USDC_LP,
  ]

  const totalSupplies = (await sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    calls: lps.map(ta => ({ target: ta, params: [] })),
    chain: 'bsc',
  }))
  const balances = {}
  sdk.util.sumMultiBalanceOf(balances, totalSupplies, true);

  const tvlUsd = lps.reduce((a, i) => {
    const balance = balances[i]
    const priceUsd = tokenPrices[i]
    return a.plus(new BigNumber(balance).times(priceUsd).div(10 ** 18))
  }, new BigNumber(0));
  return tvlUsd.toNumber()
}

async function fetch() {
  const transformAddress = await getChainTransform('bsc')

  await getTokenPrices(transformAddress)
  const [etfTvlUsd, farmsTvlUsd, regulationPoolTvlUsd, lpPairsTvlUsd] = await Promise.all([
    dexEtfTvl(),
    farmsTvl(),
    regulationPoolTvl(),
    lpPairsTvl(transformAddress)
  ])

  return etfTvlUsd + farmsTvlUsd + regulationPoolTvlUsd + lpPairsTvlUsd
}

module.exports = {
  fetch
};