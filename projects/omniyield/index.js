const { getConfig } = require("../helper/cache");
const { sumTokens2 } = require("../helper/unwrapLPs");

const ENDPOINT = "https://api.omniyield.finance/pools";

async function tvl(api) {
  const pools = await getConfig("omniyield/arbitrum", ENDPOINT);
  const vaults = (pools[api.chainId] ?? []).map((i) => i.address);
  const tokens = await api.multiCall({ calls: vaults, abi: "address:token" });
  return sumTokens2({
    api,
    tokensAndOwners: tokens.map((token, i) => [token, vaults[i]]),
  });
}

module.exports = {
  methodology:
    "TVL is calculated by summing the underlying tokens held in OmniYield pools.",
  arbitrum: { tvl },
};