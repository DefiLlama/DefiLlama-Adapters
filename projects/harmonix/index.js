const { HARMONIX_FACTORY_ABI } = require("./abis");
const { CONFIG_DATA } = require("./config");

async function tvl(api) {
  const { chain } = api;
  const { harmonixFactory } = CONFIG_DATA[chain];

  const totalTVL = await api.call({
    abi: HARMONIX_FACTORY_ABI,
    target: harmonixFactory
  });

  return {
    tether: totalTVL / 1e6,
  };
}

module.exports = {
    misrepresentedTokens: true,
    start: 1709251200, // Friday, March 1, 2024 12:00:00 AM
    methodology:
      "Aggregates total value of each Harmonix vault",
    ethereum: {
      tvl,
    },
    arbitrum: {
      tvl,
    },
    base: {
      tvl,
    },
  };
  