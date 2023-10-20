const { default: BigNumber } = require("bignumber.js");
const { getConfig } = require("../helper/cache");
const { sumTokens2, sumTokensSharedOwners } = require("../helper/unwrapLPs");
const utils = require('../helper/utils');
const { ethers } = require("ethers");

// token list
const tokenListsApiEndpoint = "https://token-list.solv.finance/vouchers-prod.json";

const getAumUsdAbi = 'function getAumInUsdg(bool maximise) view returns (uint256)';
const balanceOfABI = 'function balanceOf(address _account) view returns (uint256)';
const totalSupplyAbi = 'erc20:totalSupply';
const decimalsAbi = "uint8:decimals";
const getMarketTokenPriceAbi = 'function getMarketTokenPrice(address dataStore, tuple(address marketToken, address indexToken, address longToken, address shortToken) market, tuple(uint256 min, uint256 max) indexTokenPrice, tuple(uint256 min, uint256 max) longTokenPrice, tuple(uint256 min, uint256 max) shortTokenPrice, bytes32 pnlFactorType, bool maximize) view returns (int256, tuple(int256, int256, int256, int256, uint256, uint256, uint256, uint256, uint256, uint256, uint256))';

const glpManager = "0x321f653eed006ad1c29d174e17d96351bde22649";
const glp = "0x1aDDD80E6039594eE970E5872D247bf0414C8903";
const glpPool = "0x5C5E2858BF96cFF4ecD2672317F0f2687F50feF9";

const gmxV2Pool = "0xb4CF4Bc604740D6bD946B3E8BF89f01399296ec2";

const gmxV2Reader = "0x38d91ED96283d62182Fc6d990C24097A918a4d9b";
const gmxV2DataStore = "0xFD70de6b91282D8017aA4E741e9Ae325CAb992d8";

const gmxV2MarketToken = "0x47c031236e19d024b42f8AE6780E44A573170703";
const gmxV2IndexToken = "0x47904963fc8b2340414262125aF798B9655E58Cd";
const gmxV2LongToken = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
const gmxV2ShortToken = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const gmxV2ShortTokenPrice = "1000000000000000000000000";
const gmxV2TickersUrl = "https://arbitrum-api.gmxinfra.io/prices/tickers";
const gmxV2TokensUrl = "https://arbitrum-api.gmxinfra.io/tokens";
const USD_DECIMALS = 30;


async function tvl() {
  const { api } = arguments[3]
  const chainId = api.getChainId();
  const chain = api.chain;
  const tokens = await tokenList(chainId);
  const tokensAndOwners = [];
  tokens.forEach(function (item) {
    if (item.pool != glpPool) {
      tokensAndOwners.push([item.address, item.pool]);
    }
  })

  if (tokensAndOwners.length > 0) {
    await sumTokens2({ api, tokensAndOwners: tokensAndOwners, permitFailure: true })
  }

  if (chain == "arbitrum") {
    await glpTvl(api)
    await gmxV2Tvl(api);
  }
}

async function glpTvl(api) {
  const [
    { output: aumUsd },
    { output: totalSupply }
  ] = await Promise.all([
    api.call({
      abi: getAumUsdAbi,
      target: glpManager,
      params: [true],
    }),
    api.call({
      abi: totalSupplyAbi,
      target: glp,
    })
  ])

  const glpPrice = BigNumber(aumUsd).div(totalSupply).toNumber();
  const { output: balance } = await api.call({
    abi: balanceOfABI,
    target: glp,
    params: [glpPool],
  })

  const tvl = BigNumber(balance).times(glpPrice).toNumber();
  sumTokensSharedOwners(tvl, [glp], [glpPool], api.block, api.chain);
}

async function gmxV2Tvl(api) {
  const tickers = (await utils.fetchURL(gmxV2TickersUrl)).data;
  const tickerByToken = Object.fromEntries(tickers.map((t) => [t.tokenAddress, t]));

  const tokens = (await utils.fetchURL(gmxV2TokensUrl)).data;
  const tokenByAddress = Object.fromEntries(tokens.tokens.map((t) => [t.address, t]));

  const indexTokenTicker = tickerByToken[gmxV2IndexToken];
  const longTokenTicker = tickerByToken[gmxV2LongToken];
  const maximize = true;

  const marketTokenPrice = await api.call({
    abi: getMarketTokenPriceAbi,
    target: gmxV2Reader,
    params: [
      gmxV2DataStore,
      [
        gmxV2MarketToken,
        gmxV2IndexToken,
        gmxV2LongToken,
        gmxV2ShortToken,
      ],
      [
        indexTokenTicker.minPrice,
        indexTokenTicker.maxPrice
      ],
      [
        longTokenTicker.minPrice,
        longTokenTicker.maxPrice
      ],
      [
        gmxV2ShortTokenPrice,
        gmxV2ShortTokenPrice
      ],
      ethers.utils.formatBytes32String("MAX_PNL_FACTOR_FOR_TRADERS"),
      maximize
    ]
  })

  const price = BigNumber(marketTokenPrice[0]).div(BigNumber(10).pow(USD_DECIMALS)).toNumber();
  const balance = await api.call({
    abi: balanceOfABI,
    target: gmxV2MarketToken,
    params: [gmxV2Pool],
  })

  const decimals = await api.call({
    abi: decimalsAbi,
    target: gmxV2MarketToken,
  })

  const tvl = BigNumber(balance).div(BigNumber(10).pow(decimals)).times(BigNumber(10).pow(tokenByAddress[gmxV2ShortToken].decimals)).times(price).toFixed(0);

  api.add(gmxV2ShortToken, tvl)
  return api.getBalances()
}

async function tokenList(chainId) {
  let tokens = [];
  const allTokens = (await getConfig('solv-protocol', tokenListsApiEndpoint)).tokens;
  for (let token of allTokens) {
    if (chainId == token.chainId) {
      if (token.extensions.voucher.underlyingToken != undefined) {
        if (token.extensions.voucher.underlyingToken.symbol != "SOLV" && token.extensions.voucher.underlyingToken.symbol.indexOf("_") == -1) {
          tokens.push({
            address: token.extensions.voucher.underlyingToken.address,
            pool: token.extensions.voucher.vestingPool
          })
        }
      }
    }
  }

  return tokens;
}

// node test.js projects/solv-protocol
['ethereum', 'bsc', 'polygon', 'arbitrum'].forEach(chain => {
  module.exports[chain] = { tvl }
})