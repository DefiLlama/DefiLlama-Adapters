async function tvl(api) {
  const bal = await api.call({
    abi: "uint256:totalAssets",
    target: '0xea1a6307d9b18f8d1cbf1c3dd6aad8416c06a221',
  });
  api.add("0x35fa164735182de50811e8e2e824cfb9b6118ac2", bal);
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
