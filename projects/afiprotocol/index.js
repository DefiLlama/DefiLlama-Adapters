const afiUSD = {
  ethereum: "0x0B4C655bC989baaFe728f8270ff988A7C2B40Fd1",
};
  
// remove all TVL from afi_rwaUSDi
// there is only one depositor from all chains
const afi_rwaUSDi = {
  ethereum: "0xFEE3FBe137cDDcBc479D946EC09596e65e2F29D3",
  base: "0xed5aa9b6eb62298492c7246fe724ee088a760155", 
  monad: "0xed5AA9b6eb62298492c7246FE724ee088A760155",
};
  
const TOKENS = { afiUSD, afi_rwaUSDi };

const abis = {
  totalSupply: "function totalSupply() view returns (uint256)",
  totalAssets: "function totalAssets() view returns (uint256)",
  asset: "function asset() view returns (address)",
};
  
async function tvl(api) {
  if (api.chain === 'base' || api.chain === 'monad') return;
  
  const tokens = Object.values({ afiUSD })
    .map((chains) => chains[api.chain])
    .filter(Boolean);
  if (!tokens.length) return;
  const assets = await api.multiCall({ abi: abis.asset, calls: tokens });
  const totalAssets = await api.multiCall({ abi: abis.totalAssets, calls: tokens });
  api.addTokens(assets, totalAssets);
}
  
const chains = [
  ...new Set(Object.values(TOKENS).flatMap((chains) => Object.keys(chains))),
];

module.exports = {
  methodology:
    "TVL is the total USDC deposited in afiUSD vault.",
  misrepresentedTokens: true,
  ...Object.fromEntries(chains.map((chain) => [chain, { tvl }])),
};
  