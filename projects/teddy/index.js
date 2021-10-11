const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");

const NATIVE_ADDRESS = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
const LUSD_TOKEN_ADDRESS = "0x5f98805a4e8be255a32880fdec7f6728c6568ba0";

const STABILITY_POOL_ADDRESS = "0x7AEd63385C03Dc8ed2133F705bbB63E8EA607522";
const TROVE_MANAGER_ADDRESS = "0xd22b04395705144Fd12AfFD854248427A2776194";
const TSM = "0x4fbf0429599460D327BD5F55625E30E4fC066095"

const chain = 'avax'

async function tvl(_, ethBlock, chainBlocks) {
  const block = chainBlocks[chain]
  const stabilityPoolLusdTvl = (
    await sdk.api.erc20.balanceOf({
      target: TSM,
      owner: STABILITY_POOL_ADDRESS,
      block,
      chain
    })
  ).output;

  const troveEthTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      chain
    })
  ).output;

  return {
    [chain+':'+NATIVE_ADDRESS]: troveEthTvl,
    [chain+':'+TSM]: stabilityPoolLusdTvl,
  };
}

module.exports = {
  tvl,
  methodology: "Get tokens on stability pool and troves, TSM has been replaced by LUSD"
};
