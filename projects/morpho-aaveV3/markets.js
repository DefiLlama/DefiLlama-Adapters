const sdk = require("@defillama/sdk");
const abi = require("../helper/abis/morpho.json");
const {morphoAaveV3} = require("./addresses")
module.exports =  async (underlyings, block) => (await sdk.api.abi.multiCall({
  calls: underlyings.map(underlying => ({
    params: [underlying],
    target: morphoAaveV3,
  })),
  block,
  chain: "ethereum",
  abi: abi.morphoAaveV3.market
})).output.map(({input, output}) => {
  console.log(input);
  return {
    aToken: output.aToken,
    underlying: input.params[0],
    debtToken: output.variableDebtToken,
    scaledP2PSupply: output.deltas.supply.scaledP2PTotal,
    scaledP2PBorrow: output.deltas.borrow.scaledP2PTotal,
    p2pSupplyIndex: output.indexes.supply.p2pIndex,
    p2pBorrowIndex: output.indexes.borrow.p2pIndex,
  }
})