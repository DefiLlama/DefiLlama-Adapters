const abi = require("./abi-poolInfo.json");

const D8X_PERPETUALS_CONTRACT = "0xaB7794EcD2c8e9Decc6B577864b40eBf9204720f";

async function tvl(api) {
  const exchangeInfo = await api.call({
    abi: abi.getPoolStaticInfo,
    target: D8X_PERPETUALS_CONTRACT,
    params: [1, 255],
  });

  const marginTokens = exchangeInfo[2];
  return api.sumTokens({ owner: D8X_PERPETUALS_CONTRACT, tokens: marginTokens });
}

module.exports = {
  methodology:
    "adds up the balances of all liquidity pools in the D8X exchange",
  start: 6182628,
  polygon_zkevm: {
    tvl,
  },
};
