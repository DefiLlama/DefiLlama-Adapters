const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const zunamiContract = "0x2ffCC661011beC72e1A9524E12060983E74D14ce";
const zunamiHoldingsDecimals = 18;

const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const usdtDecimals = 6;

async function ethTvl(timestamp, block) {
  const totalHoldings = (await sdk.api.abi.call({
    block,
    abi: abi.totalHoldings,
    target: zunamiContract,
  })).output / 10 ** (zunamiHoldingsDecimals - usdtDecimals);

  return {
    [usdt]: totalHoldings,
  };
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Counts tvl deposited throuth Strategies Contract",
};
