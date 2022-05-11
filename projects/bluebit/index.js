const sdk = require("@defillama/sdk");
const abi = require("./abis.json");
const { staking } = require("../helper/staking");
const { toUSDTBalances } = require("../helper/balances");

const account = "0x0000000000000000000000000000000000000000";
const stats = "0x1B77F6f962270010B8bb8F5CECEE47C4CF4741a2";
const token = "0x4148d2Ce7816F0AE378d98b40eB3A7211E1fcF0D";
const veToken = "0xdf7C547f332351A86DB0D89a89799A7aB4eC9dEB";

const tvl = async (timestamp, block, chainBlocks) => {
  let tvl = (
    await sdk.api.abi.call({
      abi: abi.summary,
      chain: "aurora",
      target: stats,
      params: [account],
      block: chainBlocks["aurora"],
    })
  ).output.tvl;
  return toUSDTBalances(tvl / 1e18);
};

module.exports = {
  methodology: "The vaults on https://bluebit.fi are included in TVL.",
  timetravel: true,
  misrepresentedTokens: false,
  start: 62936418,
  aurora: {
    tvl: tvl,
    staking: staking(veToken, token, "aurora"),
  },
};
