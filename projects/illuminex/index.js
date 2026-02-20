const { getUniTVL } = require("../helper/unknownTokens");
const { stakingPriceLP } = require("../helper/staking");

const stakingFarmingContractAddress = "0x494847e173D6CE28b6eF7a5596df6Bc7830175e1";
const ixToken = "0x08Fe02Da45720f754e6FCA338eC1286e860d2d2f";

module.exports = {
  methodology: "Counts liquidity on illumineX Exchange, as well as IX token single staking together with liquidity mining locked LP",
  misrepresentedTokens: true,
  start: '2024-01-28',
  sapphire: {
    tvl: getUniTVL({  factory: '0x045551B6A4066db850A1160B8bB7bD9Ce3A2B5A5',  useDefaultCoreAssets: true,}),
    staking: stakingPriceLP(stakingFarmingContractAddress, ixToken, "0xf0f7c4e8edb9edcbe200a4eaec384e8a48fc7815", "oasis-network", true),
  }
}