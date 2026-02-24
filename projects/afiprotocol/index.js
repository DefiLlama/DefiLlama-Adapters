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
  };
  
  async function tvl(api) {
    const tokens = Object.values(TOKENS)
      .map((chains) => chains[api.chain])
      .filter(Boolean);
    if (!tokens.length) return;
    const totalSupplies = await api.multiCall({ abi: abis.totalSupply, calls: tokens });
    api.addTokens(tokens, totalSupplies);
  }
  
  const chains = [
    ...new Set(Object.values(TOKENS).flatMap((chains) => Object.keys(chains))),
  ];
  
  module.exports = {
    methodology:
      "TVL is the total supply of the vault tokens (afiUSD, afi-rwaUSDi).",
    misrepresentedTokens: true,
    ...Object.fromEntries(chains.map((chain) => [chain, { tvl }])),
  };
  