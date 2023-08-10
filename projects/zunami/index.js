const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getReserves } = require("../helper/ankr/utils");
const tokenAddresses = require("../config/onx/constant");
const BigNumber = require("bignumber.js");

const zunamiContract = "0x2ffCC661011beC72e1A9524E12060983E74D14ce";
const zunamiApsContract = "0xCaB49182aAdCd843b037bBF885AD56A3162698Bd";
const zethOmnipoolContract = "0x9dE83985047ab3582668320A784F6b9736c6EEa7";
const zethApsContract = "0x8fc72dcfbf39FE686c96f47C697663EE08C78380"
const zunamiHoldingsDecimals = 18;

const usdt = ADDRESSES.ethereum.USDT;
const usdtDecimals = 6;

const getWethPrice = async () => {
  const { reserve0, reserve1 } = await getReserves(tokenAddresses.usdWethPair);
  return new BigNumber(reserve1).times(1e12).div(new BigNumber(reserve0))
}

async function ethTvl(timestamp, block) {
  const totalHoldingsOmnipool = (await sdk.api.abi.call({
    block,
    abi: abi.totalHoldings,
    target: zunamiContract,
  })).output / 10 ** (zunamiHoldingsDecimals - usdtDecimals);
  const totalHoldingsAps = (await sdk.api.abi.call({
    block,
    abi: abi.totalHoldings,
    target: zunamiApsContract,
  })).output / 10 ** (zunamiHoldingsDecimals - usdtDecimals);

  const wethPrice = await getWethPrice();
  const totalHoldingsZethOmnipool = (await sdk.api.abi.call({
    block,
    abi: abi.totalHoldings,
    target: zethOmnipoolContract,
  })).output / 10 ** (zunamiHoldingsDecimals - usdtDecimals) * wethPrice
  const totalHoldingsZethAps = (await sdk.api.abi.call({
    block,
    abi: abi.totalHoldings,
    target: zethApsContract,
  })).output / 10 ** (zunamiHoldingsDecimals - usdtDecimals) * wethPrice

  const totalHoldings = totalHoldingsOmnipool + totalHoldingsAps
    + totalHoldingsZethOmnipool + totalHoldingsZethAps

  return {
    [usdt]: totalHoldings,
  };
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Total value of digital assets that are locked in Zunami Omnipools",
};