

const chains = require('./constants/chain');
const { BIG_TEN, BIG_ZERO } = require("./format");
const sdk = require("@defillama/sdk");
const multiCall = sdk.api.abi.multiCall;
const allABI = require("./constants/abi.json");
const BigNumber = require("bignumber.js");

const fetchFarm = async (chain, farm, block) => {
  const { pid, lpAddresses, token, quoteToken } = farm;
  const chainId = chains[chain];
  const addresses = require("./constants/" + chain + "/contracts.js");

  function getAddress(addrs) {
    return addrs[chainId];
  }
  
  const getMasterChefAddress = () => {
    return getAddress(addresses.masterChef);
  };

  const lpAddress = lpAddresses[chainId];
  const farmFetch = async () => {
    var _a;
    const balances = (
      await multiCall({
        chain,
        block,
        calls: [
          // Balance of token in the LP contract
          {
            target: getAddress(token.address),
            params: lpAddress,
          },
          // Balance of quote token on LP contract
          {
            target: getAddress(quoteToken.address),
            params: lpAddress,
          },
          // Balance of LP tokens in the master chef contract
          {
            target: lpAddress,
            params: getMasterChefAddress(),
          },
        ].filter((_) => _.params),
        abi: "erc20:balanceOf",
      })
    ).output.map((_) => _.output);

    const decimals = (
      await multiCall({
        chain,
        block,
        calls: [
          {
            target: getAddress(token.address),
          },
          {
            target: getAddress(quoteToken.address),
          },
        ],
        abi: "erc20:decimals",
      })
    ).output.map((_) => _.output);

    const lpTotal = (
      await multiCall({
        chain,
        block,
        calls: [
          {
            target: lpAddress,
          },
        ],
        abi: "erc20:totalSupply",
      })
    ).output.map((_) => _.output);


    const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC] = balances;
    const [lpTotalSupply] = lpTotal;
    const [tokenDecimals, quoteTokenDecimals] = decimals;

    // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
    const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(
      new BigNumber(lpTotalSupply)
    );
    // Raw amount of token in the LP, including those not staked
    const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(
      BIG_TEN.pow(tokenDecimals)
    );
    const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(
      BIG_TEN.pow(quoteTokenDecimals)
    );
    // Amount of token in the LP that are staked in the MC (i.e amount of token * lp ratio)
    const tokenAmountMc = tokenAmountTotal.times(lpTokenRatio);
    const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio);
    // Total staked in LP, in quote token value
    const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2));

    // Only make masterchef calls if farm has pid
    const [info, totalAllocPoint] =
      pid || pid === 0
        ? [
            (
              await multiCall({
                chain,
                block,
                calls: [
                  {
                    target: getMasterChefAddress(),
                    name: "poolInfo",
                    params: [pid],
                  },
                ],
                abi: allABI["poolInfo"],
              })
            ).output.map((_) => _.output)[0],
            (
              await multiCall({
                chain,
                block,
                calls: [
                  {
                    target: getMasterChefAddress(),
                    name: "totalAllocPoint",
                  },
                ],
                abi: allABI["totalAllocPoint"],
              })
            ).output.map((_) => _.output)[0],
          ]
        : [null, null];

    const allocPoint = info ? new BigNumber(info.allocPoint) : BIG_ZERO;
    const poolWeight = totalAllocPoint
      ? allocPoint.div(new BigNumber(totalAllocPoint))
      : BIG_ZERO;
    return {
        ...farm,
        tokenAmountMc: tokenAmountMc.toJSON(),
        quoteTokenAmountMc: quoteTokenAmountMc.toJSON(),
        tokenAmountTotal: tokenAmountTotal.toJSON(),
        quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
        lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
        lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
        tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
        poolWeight: poolWeight.toJSON(),
        multiplier: `${allocPoint.div(100).toString()}X`,
    };
  };
  // // In some browsers promise above gets stuck that causes fetchFarms to not proceed.
  // const timeout = new Promise((resolve) => {
  //   const id = setTimeout(() => {
  //     clearTimeout(id);
  //     resolve({});
  //   }, 25000);
  // });
  return await farmFetch();
};

const filterFarmsByQuoteToken = (
  farms,
  preferredQuoteTokens = ["BUSD", "wBNB"]
) => {
  const preferredFarm = farms.find((farm) => {
    return preferredQuoteTokens.some((quoteToken) => {
      return farm.quoteToken.symbol === quoteToken;
    });
  });
  return preferredFarm || farms[0];
};


const getFarmFromTokenSymbol = (
  farms,
  tokenSymbol,
  preferredQuoteTokens
) => {
  const farmsWithTokenSymbol = farms.filter(
    (farm) => farm.token.symbol === tokenSymbol
  );
  const filteredFarm = filterFarmsByQuoteToken(
    farmsWithTokenSymbol,
    preferredQuoteTokens
  );
  return filteredFarm;
};

const getFarmBaseTokenPrice = (
  farm,
  quoteTokenFarm,
  bnbPriceBusd
) => {
  const hasTokenPriceVsQuote = Boolean(farm.tokenPriceVsQuote);

  if (farm.quoteToken.symbol === "BUSD") {
    return hasTokenPriceVsQuote
      ? new BigNumber(farm.tokenPriceVsQuote)
      : BIG_ZERO;
  }

  if (farm.quoteToken.symbol === "wBNB") {
    return hasTokenPriceVsQuote
      ? bnbPriceBusd.times(farm.tokenPriceVsQuote)
      : BIG_ZERO;
  }

  // We can only calculate profits without a quoteTokenFarm for BUSD/BNB farms
  if (!quoteTokenFarm) {
    return BIG_ZERO;
  }

  // Possible alternative farm quoteTokens:
  // UST (i.e. MIR-UST), pBTC (i.e. PNT-pBTC), BTCB (i.e. bBADGER-BTCB), ETH (i.e. SUSHI-ETH)
  // If the farm's quote token isn't BUSD or wBNB, we then use the quote token, of the original farm's quote token
  // i.e. for farm PNT - pBTC we use the pBTC farm's quote token - BNB, (pBTC - BNB)
  // from the BNB - pBTC price, we can calculate the PNT - BUSD price
  if (quoteTokenFarm.quoteToken.symbol === "wBNB") {
    const quoteTokenInBusd = bnbPriceBusd.times(
      quoteTokenFarm.tokenPriceVsQuote
    );
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(farm.tokenPriceVsQuote).times(quoteTokenInBusd)
      : BIG_ZERO;
  }

  if (quoteTokenFarm.quoteToken.symbol === "BUSD") {
    const quoteTokenInBusd = quoteTokenFarm.tokenPriceVsQuote;
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? new BigNumber(farm.tokenPriceVsQuote).times(quoteTokenInBusd)
      : BIG_ZERO;
  }

  // Catch in case token does not have immediate or once-removed BUSD/wBNB quoteToken
  return BIG_ZERO;
};

const getFarmQuoteTokenPrice = (
  farm,
  quoteTokenFarm,
  bnbPriceBusd
) => {
  if (farm.quoteToken.symbol === "BUSD") {
    return new BigNumber(1);
  }

  if (farm.quoteToken.symbol === "wBNB") {
    return bnbPriceBusd;
  }

  if (!quoteTokenFarm) {
    return BIG_ZERO;
  }

  if (quoteTokenFarm.quoteToken.symbol === "wBNB") {
    return quoteTokenFarm.tokenPriceVsQuote
      ? bnbPriceBusd.times(quoteTokenFarm.tokenPriceVsQuote)
      : BIG_ZERO;
  }

  if (quoteTokenFarm.quoteToken.symbol === "BUSD") {
    return quoteTokenFarm.tokenPriceVsQuote
      ? new BigNumber(quoteTokenFarm.tokenPriceVsQuote)
      : BIG_ZERO;
  }

  return BIG_ZERO;
};

const fetchFarmsPrices = async (farms) => {
  const bnbBusdFarm = farms.find((farm) => farm.pid === 2);
  const bnbPriceBusd = bnbBusdFarm.tokenPriceVsQuote
    ? new BigNumber(1).div(bnbBusdFarm.tokenPriceVsQuote)
    : BIG_ZERO;

  const farmsWithPrices = farms.map((farm) => {
    const quoteTokenFarm = getFarmFromTokenSymbol(
      farms,
      farm.quoteToken.symbol
    );
    const baseTokenPrice = getFarmBaseTokenPrice(
      farm,
      quoteTokenFarm,
      bnbPriceBusd
    );
    const quoteTokenPrice = getFarmQuoteTokenPrice(
      farm,
      quoteTokenFarm,
      bnbPriceBusd
    );
    const token = { ...farm.token, busdPrice: baseTokenPrice.toJSON() };
    const quoteToken = {
      ...farm.quoteToken,
      busdPrice: quoteTokenPrice.toJSON(),
    };
    return { ...farm, token, quoteToken };
  });

  return farmsWithPrices;
};


async function fetchFarms(chain, block) {
  try {
    const farms = require("./constants/" + chain + "/farms");
    let allInfos = await Promise.all(
      farms.map((_) => fetchFarm(chain, _, block))
    );
    allInfos = fetchFarmsPrices(allInfos);
    return allInfos;
  } catch(e) {
    console.log("fetchFarms.error", e);
  }
}

module.exports = fetchFarms;