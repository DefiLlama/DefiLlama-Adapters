const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abis.json");
const { staking } = require("../helper/staking");
const { toUSDTBalances } = require("../helper/balances");

const account = ADDRESSES.null;
const token = "0x4148d2Ce7816F0AE378d98b40eB3A7211E1fcF0D";
const veToken = "0xdf7C547f332351A86DB0D89a89799A7aB4eC9dEB";

const tvl = async (api) => {
  const stats = "0x36C6FBA304009a036BaaE1a24a570B450Ae14a5C"

  let { tvl } = await api.call({
    abi: abi.summary,
    target: stats,
    params: [account],
  })
  return toUSDTBalances(tvl / 1e18);
};

module.exports = {
  methodology: "The vaults on https://bluebit.fi are included in TVL.",
  aurora: {
    tvl: tvl,
    staking: staking(veToken, token),
  },
};
