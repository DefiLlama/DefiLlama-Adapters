const afiUSD = {
  ethereum: "0x0B4C655bC989baaFe728f8270ff988A7C2B40Fd1",
};

const afi_rwaUSDi = {
  ethereum: "0xFEE3FBe137cDDcBc479D946EC09596e65e2F29D3",
  base: "0xed5aa9b6eb62298492c7246fe724ee088a760155"
};

const TOKENS = { afiUSD, afi_rwaUSDi };

const abis = {
  totalSupply: "function totalSupply() view returns (uint256)",
  asset: "function asset() view returns (address)",
  convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256)",
};

async function tvl(api) {
  const tokens = Object.values(TOKENS)
    .map((chains) => chains[api.chain])
    .filter(Boolean);
  if (!tokens.length) return;
  const [totalSupplies, underlyingAssets] = await Promise.all([
    api.multiCall({ abi: abis.totalSupply, calls: tokens }),
    api.multiCall({ abi: abis.asset, calls: tokens }),
  ]);

  const assetAmounts = await api.multiCall({
    abi: abis.convertToAssets,
    calls: tokens.map((token, i) => ({ target: token, params: [totalSupplies[i]] })),
  });

  for (let i = 0; i < tokens.length; i++) {
      api.add(underlyingAssets[i], assetAmounts[i]);
  }
}

const chains = [
  ...new Set(Object.values(TOKENS).flatMap((chains) => Object.keys(chains))),
];

module.exports = {
  methodology:
    "Calculates the TVL of afiUSD and AFI-rwaUSDi by converting the total supply to the underlying asset using the convertToAssets function.",
  misrepresentedTokens: true,
  ...Object.fromEntries(chains.map((chain) => [chain, { tvl }])),
};
