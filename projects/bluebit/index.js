const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abis.json");
const { staking } = require("../helper/staking");
const { toUSDTBalances } = require("../helper/balances");
const { getBlock } = require("../helper/http");

const account = ADDRESSES.null;
const token = "0x4148d2Ce7816F0AE378d98b40eB3A7211E1fcF0D";
const veToken = "0xdf7C547f332351A86DB0D89a89799A7aB4eC9dEB";

const tvl = async (timestamp, block, chainBlocks) => {
  block = await getBlock(timestamp, 'aurora', chainBlocks)
  const stats = block > 66730102 
    ? "0x36C6FBA304009a036BaaE1a24a570B450Ae14a5C" 
    : "0xd1bc52B30b1031a9283Cc9C84575Fc3837A098F5";

  let tvl = (
    await sdk.api.abi.call({
      abi: abi.summary,
      chain: "aurora",
      target: stats,
      params: [account],
      block: block,
    })
  ).output.tvl;
  return toUSDTBalances(tvl / 1e18);
};

module.exports = {
  methodology: "The vaults on https://bluebit.fi are included in TVL.",
  aurora: {
    tvl: tvl,
    staking: staking(veToken, token),
  },
};
