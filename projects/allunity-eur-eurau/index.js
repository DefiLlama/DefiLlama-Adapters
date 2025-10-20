const TOKEN = "0x4933A85b5b5466Fbaf179F72D3DE273c287EC2c2";
const DECIMALS = 6;
const CHAINLINK_EUR_USD_FEED = "0xb49f677943BC038e9857d61E7d053CaA2C1734C1";

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const [supply, eurUsdRaw] = await Promise.all([
        api.call({ abi: "erc20:totalSupply", target: TOKEN }),
        api.call({
          abi: "int256:latestAnswer",
          target: CHAINLINK_EUR_USD_FEED,
        }),
      ]);

      const eurUsd = Number(eurUsdRaw) / 1e8;
      const amountInTokenUnits = Number(supply) / 10 ** DECIMALS;
      const tvlInUsd = amountInTokenUnits * eurUsd;

      return {
        usd: tvlInUsd,
      };
    },
  },
};
