const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const startBlock = 14255781;

const zunamiContract = "0xf790d57443C2E9aDEc8C42bA92Bff5B7Ec84A895";
const zunamiHoldingsDecimals = 18;

const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const usdtDecimals = 6;

const ethTvl = async () => {
  const totalHoldings = (await sdk.api.abi.call({
    block: startBlock,
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
