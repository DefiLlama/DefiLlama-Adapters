const YPUSD_CONTRACT = "0x5E16e1F5BABE0b86094fbfC11EC0849F6B07f487";

async function tvl(api) {
  const totalAssets = await api.call({
    target: YPUSD_CONTRACT,
    abi: "function totalAssets() view returns (uint256)"
  });
  
  // totalAssets() returns pUSD amount with 6 decimals, pUSD is 1:1 pegged to USD
  api.addUSDValue(totalAssets / 1e6);
}

module.exports = {
  methodology: "TVL is calculated by calling totalAssets() on the ypUSD vault, which returns the total pUSD locked (1:1 USD value)",
  bsc: {
    tvl,
  },
};
