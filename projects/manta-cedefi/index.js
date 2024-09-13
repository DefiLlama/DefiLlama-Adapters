const tokens = [
  {
    name: "mBTC",
    address: "0x1468177DbCb2a772F3d182d2F1358d442B553089",
    decimals: 18,
    coinGeckoId: "bitcoin",
  },
  {
    name: "mETH",
    address: "0xACCBC418a994a27a75644d8d591afC22FaBA594e",
    decimals: 18,
    coinGeckoId: "ethereum",
  },
  {
    name: "mUSD",
    address: "0x649d4524897cE85A864DC2a2D5A11Adb3044f44a",
    decimals: 18,
    coinGeckoId: "tether",
  },
];

async function tvl(api) {
  const balances = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: tokens.map((item) => item.address),
  });
  tokens.forEach((token, index) => {
    api.addCGToken(token.coinGeckoId, balances[index] / 10 ** tokens[index].decimals);
  })
}

module.exports = {
  manta: {
    tvl,
  },
}