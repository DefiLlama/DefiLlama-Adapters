// UnblockEquity TVL Adapter for DefiLlama
// 24 MetaMorpho V2 vaults on Base — home equity loans (USDC lending against tokenized property liens)
// TVL = sum of totalAssets() across all 24 vaults (ERC4626 standard)
// Factory: 0x4501125508079A99ebBebCE205DeC9593C2b5857 (official Morpho MetaMorpho factory)

const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// 24 UnblockEquity MetaMorpho vaults on Base (deployed Phase 06.1, 2026-03-25)
// Named: {Verification}-{Recovery}-{BreathingRoom} (Verified/Prime/Standard x Lien-Only/Foreclosure x None/BR3/BR6/BR12)
const VAULTS = [
  "0x287397Fd29aBCdb1f514179099121895A2f5bEAF", // V-LO-NONE
  "0x376736A69B8F9c350F76E0b2802466Eaee7E058f", // V-LO-BR3
  "0xd6313868B5CeBAd6fDc3aE48F80917B385C01c71", // V-LO-BR6
  "0x2FFcbDEa42311515E3dB1F873A1Cea0D463B5Ced", // V-LO-BR12
  "0x0eD4c2cfff2Ec06079e723F51aeFC8cdF073ea68", // V-FC-NONE
  "0x34dDd63FEA2868EeF439279D6FeCa7d5AcFc4F53", // V-FC-BR3
  "0xc24C630D27CBF1Da6A78B09821212eb9c5e1be40", // V-FC-BR6
  "0x8E246a89a7F8ffD4efD7d037bD585F7741C0C482", // V-FC-BR12
  "0x13D2E770cefB62A8Aa4e3393d59F88707AbD4dd5", // P-LO-NONE
  "0xCc19805E91C66Ca6a3dd437E8F6d579ca9727804", // P-LO-BR3
  "0x2018963CA1e5ACeb88B7fA8738e4AEC846beD752", // P-LO-BR6
  "0x618fFcf6fF74dC3766B892B7913BF5074B913eF2", // P-LO-BR12
  "0x12d6bA2c11Bbb96F8f91b0412593b87dB4E2ABE2", // P-FC-NONE
  "0xFC274721AFdd37dB10419d08bd0db59E5Fcfb219", // P-FC-BR3
  "0x098A23332008Cffaf283E3b0e8EcDEcfDeb6849c", // P-FC-BR6
  "0xf6EA5C33F0D33B56AAda9AF7Dd1C4203BB83C82F", // P-FC-BR12
  "0x2BE1d9ddBbd70E7b148E8AdE884600268a0B28BD", // S-LO-NONE
  "0x060b5d11B1303FaB362bAF100EB37601F04C2AFD", // S-LO-BR3
  "0x8Dfc0CaF025E62C634Ea179Ce04015f3ae51938a", // S-LO-BR6
  "0xbfc2B2ECF46b9b585199920d95F972E42DD23e51", // S-LO-BR12
  "0xef7EEeed223a45EB09808F98cA2B15cA16C7306D", // S-FC-NONE
  "0x4d390F54327b8d4ca6DFaF8db58BCFdF0270697b", // S-FC-BR3
  "0xE6dfc9b8057135165B1aAAA741FbbBe0aF416104", // S-FC-BR6
  "0x01EB25A573F1e86f46326B0DD1b4AB344ccB168E", // S-FC-BR12
];

// totalAssets() is the ERC4626 standard — returns total USDC (6 decimals) managed by vault
const TOTAL_ASSETS_ABI = "uint256:totalAssets";

async function tvl(api) {
  const results = await api.multiCall({
    abi: TOTAL_ASSETS_ABI,
    calls: VAULTS.map((target) => ({ target })),
  });

  // Sum all vault TVLs and add USDC to the balance sheet
  const total = results.reduce((sum, val) => sum + BigInt(val ?? 0), BigInt(0));
  api.add(USDC, total);
}

module.exports = {
  methodology:
    "Sum of totalAssets() across all 24 UnblockEquity MetaMorpho V2 vaults on Base. Each vault accepts USDC deposits and lends against tokenized residential property liens (ERC-1155). Vaults are segmented by borrower verification level (Verified/Prime/Standard), recovery type (Lien-Only/Foreclosure), and escrow tier (None/BR3/BR6/BR12).",
  start: 1774396800, // 2026-03-25 UTC — Phase 06.1 deployment date
  base: {
    tvl,
  },
};
