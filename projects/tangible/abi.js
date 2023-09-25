module.exports = {
  apGetAddress: "function getAddress(bytes32) view returns (address)",
  getPriceManager: "address:priceManager",
  getCategories: "address[]:getCategories",
  getTreasuryValue: "function getTreasuryValue() view returns (tuple(uint256 stable, uint256 usdr, uint256 rwa, uint256 tngbl, uint256 liquidity, tuple(uint256 tngbl, uint256 underlying, uint256 liquidity) tngblLiquidity, uint256 debt, uint256 total, uint256 rwaVaults, uint256 rwaEscrow, bool rwaValueNotLatest) value)",
  getTotalSupply: "uint256:totalSupply",
  getTokenByIndex: "function tokenByIndex(uint256 index) view returns (uint256)",
  getTnftCustody: "function tnftCustody(uint256) view returns (bool)",
  getItemPriceBatchTokenIds: "function itemPriceBatchTokenIds(address nft, address paymentUSDToken, uint256[] tokenIds) view returns (uint256[] weSellAt, uint256[] weSellAtStock, uint256[] weBuyAt, uint256[] weBuyAtStock, uint256[] lockedAmount)",
  getPair: "function getPair(address _pair, address _account) view returns (tuple(address pair_address, string symbol, string name, uint256 decimals, bool stable, uint256 total_supply, address token0, string token0_symbol, uint256 token0_decimals, uint256 reserve0, uint256 claimable0, address token1, string token1_symbol, uint256 token1_decimals, uint256 reserve1, uint256 claimable1, address gauge, uint256 gauge_total_supply, address fee, address bribe, uint256 emissions, address emissions_token, uint256 emissions_token_decimals, uint256 account_lp_balance, uint256 account_token0_balance, uint256 account_token1_balance, uint256 account_gauge_balance, uint256 account_gauge_earned) _pairInfo)",
  getPearlBalanceCaviar: "function balanceOfVePearl() view returns (uint256)",
}