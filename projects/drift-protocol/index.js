const { PublicKey } = require("@solana/web3.js");
const { getTokenAccountBalances } = require("../helper/solana");
const {
  initialize,
  getSpotMarketVaultPublicKey,
  getInsuranceFundVaultPublicKey,
} = require("@drift-labs/sdk");

async function getSdkProps() {
  const sdkConfig = initialize({ env: "mainnet-beta" });
  const spotMarkets = sdkConfig.SPOT_MARKETS;

  return {
    spotMarkets,
    sdkConfig,
  };
}

async function tvl() {
  const sdkProps = await getSdkProps();
  const spotMarkets = sdkProps.spotMarkets;
  const sdkConfig = sdkProps.sdkConfig;

  const spotMarketVaults = await Promise.all(
    spotMarkets.map((mkt) =>
      getSpotMarketVaultPublicKey(
        new PublicKey(sdkConfig.DRIFT_PROGRAM_ID),
        mkt.marketIndex
      )
    )
  );

  const insuranceFundVaults = await Promise.all(
    spotMarkets.map((mkt) =>
      getInsuranceFundVaultPublicKey(
        new PublicKey(sdkConfig.DRIFT_PROGRAM_ID),
        mkt.marketIndex
      )
    )
  );

  const tvlBalances = await getTokenAccountBalances([
    ...spotMarketVaults,
    ...insuranceFundVaults,
  ]);

  const tvlOutput = Object.entries(tvlBalances).reduce(
    (previous, [token, amount]) => {
      return {
        ...previous,
        [`solana:${token}`]: amount,
      };
    },
    {}
  );

  return tvlOutput;
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: `Calculates TVL as the the sum total of protocol deposits and funds staked to the insurance fund.`,
};
