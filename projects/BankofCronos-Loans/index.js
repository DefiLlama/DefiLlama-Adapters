const { sumTokens2 } = require("../helper/unwrapLPs");

// Active Pool holds total system collateral value(deposited collateral)
const ACTIVE_POOL_ADDRESS = "0xa86Ba8b60Aa4d943D15FF2894964da4C2A8F1B03";

async function tvl(_, _b, _cb, { api, }) {
  const [tokens] = await api.call({ target: ACTIVE_POOL_ADDRESS, abi: 'function getAllCollateral() view returns (address[], uint256[])' })
  return sumTokens2({ api, owner: ACTIVE_POOL_ADDRESS, tokens })
}

module.exports = {
  start: 6949784,
  cronos: {
    tvl,
  },
  methodology: "Total CDP collateral value",
};
