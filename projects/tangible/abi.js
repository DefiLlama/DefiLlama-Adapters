module.exports = {
  apGetAddress: "function getAddress(bytes32) view returns (address)",
  getPriceManager: "address:priceManager",
  getCategories: "address[]:getCategories",
  getTreasuryValue: "function getTreasuryValue() view returns (tuple(uint256 stable, uint256 usdr, uint256 rwa, uint256 tngbl, uint256 liquidity, tuple(uint256 tngbl, uint256 underlying, uint256 liquidity) tngblLiquidity, uint256 debt, uint256 total, uint256 rwaVaults, uint256 rwaEscrow, bool rwaValueNotLatest) value)",
  getTotalSupply: "uint256:totalSupply",
  getTokenByIndex: "function tokenByIndex(uint256 index) view returns (uint256)",
  getTnftCustody: "function tnftCustody(uint256) view returns (bool)",
  getItemPriceBatchTokenIds: "function itemPriceBatchTokenIds(address nft, address paymentUSDToken, uint256[] tokenIds) view returns (uint256[] weSellAt, uint256[] weSellAtStock, uint256[] weBuyAt, uint256[] weBuyAtStock, uint256[] lockedAmount)",
}