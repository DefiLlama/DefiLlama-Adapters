const Contracts = {
  Vault: "0x2A68c98bD43AA24331396F29166aeF2Bfd51343f",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  Treasury: "0x53B4dBdbc9861A626C62DE557ED4f1560FFa3822"
};

async function tvl(api) {
  const reserves = await api.call({  abi: 'function totalAssets() external view returns (uint256)', target: Contracts.Vault })
  api.add(Contracts.USDC, reserves)
}


module.exports = {
  celo: {
    tvl,
  },
};
