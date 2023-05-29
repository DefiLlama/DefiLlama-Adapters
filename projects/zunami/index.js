const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const zunamiContract = "0x2ffCC661011beC72e1A9524E12060983E74D14ce";
const zunamiApsContract = "0xCaB49182aAdCd843b037bBF885AD56A3162698Bd";
const zunamiHoldingsDecimals = 18;

const usdt = ADDRESSES.ethereum.USDT;
const usdtDecimals = 6;

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

  const totalHoldings = totalHoldingsOmnipool + totalHoldingsAps;

  return {
    [usdt]: totalHoldings,
  };
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Counts tvl deposited throuth Strategies Contract",
};
