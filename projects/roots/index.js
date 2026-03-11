const sdk = require("@defillama/sdk");

/* !Trove Contracts */
const TroveContracts = {
    WBERA_HONEY_Trove: "0x7716065f4F9B225bB628ae75FA42157F14BFE70C", 
    WETH_WBERA_Trove: "0x950451c4736DD4452602CB25dAf48C83ad7391E9",
    WBTC_WBERA_Trove: "0x2F8dc9f7201061F4a399fB602CE4816fFc86DDe5",
    BYUSD_HONEY_Trove: "0x94704805a75F9D6A18B7a2338102c63D922F1915", 
    USDCe_HONEY_Trove: "0x857f5468398c873EcFc208765ad9632bb9dDab0C",
}

const VaultTokens = {
    WBERA_HONEY: "0x2c4a603A2aA5596287A06886862dc29d56DbC354",
    WETH_WBERA: "0xdd70a5ef7d8cfe5c5134b5f9874b09fb5ce812b4",
    WBTC_WBERA: "0x38fdD999Fe8783037dB1bBFE465759e312f2d809",
    BYUSD_HONEY: "0xde04c469ad658163e2a5e860a03a86b52f6fa8c8",
    USDCe_HONEY: "0xf961a8f6d8c69e7321e78d254ecafbcc3a637621",
}

const MEAD = "0xEDB5180661F56077292C92Ab40B1AC57A279a396"

async function tvl(api) {
  const balances = {}
  
  for (const [troveName, troveAddress] of Object.entries(TroveContracts)) {
    const vaultTokenKey = troveName.replace('_Trove', '')
    const tokenAddress = VaultTokens[vaultTokenKey].toLowerCase()
    
    const collateral = await api.call({
      target: troveAddress,
      abi: "function getEntireSystemColl() view returns (uint256)",
    })
    
    sdk.util.sumSingleBalance(balances, tokenAddress, collateral, api.chain)
  }

  return balances
}

async function borrowed(api) {
  const balances = {}
  let totalBorrowed = 0n

  for (const [, troveAddress] of Object.entries(TroveContracts)) {
    const debt = await api.call({
      target: troveAddress,
      abi: "function getEntireSystemDebt() view returns (uint256)",
    })
    totalBorrowed += BigInt(debt)
  }

  // Add total MEAD debt
  // MEAD got no price oracle for now, it's traded on https://hub.berachain.com/pools/0x2a9ea10b60ab02e9b8960a08b4996e6bf5ea5eab000000000000000000000162/details/
  sdk.util.sumSingleBalance(balances, MEAD.toLowerCase(), totalBorrowed.toString(), api.chain)
  return balances
}

module.exports = {
  berachain: {
    tvl,
    borrowed,
  },
  start: '2025-05-09',
    methodology: "Calculates TVL as the sum of all collateral in Troves (using getEntireSystemColl). Separately tracks borrowed amounts from each Trove (using getEntireSystemDebt) denominated in MEAD.",
};
