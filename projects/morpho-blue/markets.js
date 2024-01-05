const abi = require("../helper/abis/morpho.json");
const { morphoBlue } = require("./addresses");

module.exports = async (whitelistedIds, api) => {
  const calls = whitelistedIds.map((id) => ({
    target: morphoBlue,
    params: [id],
  }));

  const [marketResults, underlyingResults] = await Promise.all([
    api.multiCall({ calls, abi: abi.morphoBlueFunctions.market }),
    api.multiCall({ calls, abi: abi.morphoBlueFunctions.idToMarketParams }),
  ]);

  return marketResults.map((marketOutput, i) => {
    const underlyingOutput = underlyingResults[i];
    return {
      id: whitelistedIds[i],
      loanToken: underlyingOutput.loanToken,
      collateralToken: underlyingOutput.collateralToken,
      totalSupplyAssets: marketOutput.totalSupplyAssets,
      totalBorrowAssets: marketOutput.totalBorrowAssets,
    };
  });
};
