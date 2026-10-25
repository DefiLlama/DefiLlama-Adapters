const { getFactoryTvl } = require("../terraswap/factoryTvl");

// terraswap-style CosmWasm factory on Injective
const factory = "inj1k9lcqtn3y92h4t3tdsu7z8qx292mhxhgsssmxg";

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the DEX: the reserves of every pair contract created by the Choice Exchange v1 (CosmWasm) factory on Injective.",
  injective: { tvl: getFactoryTvl(factory) },
};
