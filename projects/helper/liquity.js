const sdk = require("@defillama/sdk");

function getLiquityTvl(ETH_ADDRESS, TROVE_MANAGER_ADDRESS, chain) {
  return async (_, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain]

    const troveEthTvl = (
      await sdk.api.abi.call({
        target: TROVE_MANAGER_ADDRESS,
        abi: "uint256:getEntireSystemColl",
        block,
        chain,
      })
    ).output;

    return {
      [chain+':'+ETH_ADDRESS]: troveEthTvl,
    };
  }
}

module.exports = {
  getLiquityTvl
};
