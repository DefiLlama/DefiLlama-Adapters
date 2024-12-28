const abi = require("../helper/abis/morpho.json");
const { morphoAaveV3 } = require("./addresses")
module.exports = async (underlyings, api) => (await api.multiCall({
  calls: underlyings,
  target: morphoAaveV3,
  abi: abi.morphoAaveV3.market
})).map((output, i) => {
  return {
    aToken: output.aToken,
    underlying: underlyings[i],
    debtToken: output.variableDebtToken,
    scaledP2PSupply: output.deltas.supply.scaledP2PTotal,
    scaledP2PBorrow: output.deltas.borrow.scaledP2PTotal,
    p2pSupplyIndex: output.indexes.supply.p2pIndex,
    p2pBorrowIndex: output.indexes.borrow.p2pIndex,
  }
})