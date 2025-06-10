const readerAbi = /** @type {const} */ ({
  openMarkets: "function openMarkets() view returns ((address,address,uint256)[])",
  offerList: "function offerList((address,address,uint256),uint256,uint256) view returns (uint256,uint256[],(uint256,uint256,int256,uint256)[],(address,uint256,uint256,uint256)[])"
})

const vaultAbi = /** @type {const} */ ({
  getUnderlyingBalances: "function getUnderlyingBalances() public view returns (uint256 baseAmount, uint256 quoteAmount)",
})

module.exports = {
  readerAbi,
  vaultAbi,
}