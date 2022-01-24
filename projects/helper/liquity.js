const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./abis/getEntireSystemColl.abi.json");

const TUSD = "0x0000000000085d4780b73119b644ae5ecd22b376"

function getLiquityTvl(ETH_ADDRESS, LUSD_TOKEN_ADDRESS, STABILITY_POOL_ADDRESS, TROVE_MANAGER_ADDRESS, chain, useTusd = false) {
  return async (_, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain]
    const stabilityPoolLusdTvl = (
      await sdk.api.erc20.balanceOf({
        target: LUSD_TOKEN_ADDRESS,
        owner: STABILITY_POOL_ADDRESS,
        block,
        chain,
      })
    ).output;

    const troveEthTvl = (
      await sdk.api.abi.call({
        target: TROVE_MANAGER_ADDRESS,
        abi: getEntireSystemCollAbi,
        block,
        chain,
      })
    ).output;

    return {
      [chain+':'+ETH_ADDRESS]: troveEthTvl,
      [useTusd? TUSD : chain+':'+LUSD_TOKEN_ADDRESS]: stabilityPoolLusdTvl,
    };
  }
}

module.exports = {
  getLiquityTvl
};
