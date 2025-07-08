const { getConfig } = require("../helper/cache");
const { sumTokens } = require("../helper/chain/starknet");

const MarketManager =
  "0x38925b0bcf4dce081042ca26a96300d9e181b910328db54a6c89e5451503f5";
const ReplicatingStrategy =
  "0x2ffce9d48390d497f7dfafa9dfd22025d9c285135bcc26c955aea8741f081d2";

async function tvl(api) {
  const tokens = await getConfig(
    "haiko",
    "https://app.haiko.xyz/api/v1/tokens?network=mainnet"
  );
  return sumTokens({
    api,
    owners: [MarketManager, ReplicatingStrategy],
    tokens: tokens.map((t) => t.coingeckoAddress),
  });
}

module.exports = {
  methodology:
    "Value of deposits in LP positions and Strategy Vaults, an automation layer that provides and rebalances pool liquidity on behalf of LPs.",
  starknet: {
    tvl,
  },
};
