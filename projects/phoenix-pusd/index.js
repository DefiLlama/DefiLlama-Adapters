const VAULT_CONTRACT = "0xc01047929BbA07C95ed372d201DEE0CD98F26bD4";

async function tvl(api) {
  const marketCap = await api.call({
    target: VAULT_CONTRACT,
    abi: "function getPUSDMarketCap() view returns (uint256)"
  });
  
  // getPUSDMarketCap() returns pUSD market cap (needs to be divided by pusd decimals)
  // pUSD has 6 decimals
  api.addUSDValue(marketCap / 1e6);
}

module.exports = {
  methodology: "TVL is calculated by calling getPUSDMarketCap() on the Vault contract, which returns the total pUSD circulating market cap",
  bsc: {
    tvl,
  },
};
