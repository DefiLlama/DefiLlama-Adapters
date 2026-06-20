// DefiLlama TVL adapter — Auxite (tokenized precious metals on Base)
// Submit to DefiLlama-Adapters at: projects/auxite/index.js
//
// Fully on-chain: AUM = Σ (token totalSupply in grams) × (per-gram USD NAV).
// Supply is read from the canonical AuxiteMetal tokens; the per-gram NAV is
// read from the AuxiteOracleV2 on-chain price oracle (no external API).
// 1 token = 1 gram of allocated physical metal (3 decimals).

const ORACLE = "0xDB36fFD8a762226928d62a2Fe6F19bB329b5EbbE"; // AuxiteOracleV2 (Base)

// Canonical AuxiteMetal tokens (Base) + on-chain metalId = keccak256(name).
const METALS = [
  { token: "0xCef9D7593E8Ba796eE05C54B8983B7749bB1218a", id: "0xdbd17891fc491ac6717dd01ab1f90f82509f1f2e91cd5066f68805860fbdeb72" }, // AUXG / GOLD
  { token: "0xB0aC63aeD12b5A0Ee710618D99444bf126068c1a", id: "0x75e02a3ee626f5d4b8bc98cc8de5b102ee067608b6066832ffdc71f78445ac2b" }, // AUXS / SILVER
  { token: "0x39F314fb20668997A2ADDaB1eA9236e0072D5E2D", id: "0xecbba860b0e9fdd311c554f0b28ccf3d616b99de2f208aa830a91bd846d16657" }, // AUXPT / PLATINUM
  { token: "0x6e4837fCf158D15ABFdf90b3954D041D452BE832", id: "0x06be24fb53be069d32979b5b3d41617a459d2f6b1b018dd945ebb5b9dc321d15" }, // AUXPD / PALLADIUM
];

const TOKEN_DECIMALS = 3; // 1 token = 1 gram = 1000 raw units
const PRICE_E6 = 1e6;

async function tvl(api) {
  // On-chain supply per token (grams) and per-gram NAV (E6) from the oracle.
  const supplies = await api.multiCall({
    abi: "uint256:totalSupply",
    calls: METALS.map((m) => m.token),
  });
  const pricesE6 = await api.multiCall({
    target: ORACLE,
    abi: "function getPricePerGramE6(bytes32) view returns (uint256)",
    calls: METALS.map((m) => ({ params: [m.id] })),
  });

  let usd = 0;
  METALS.forEach((_, i) => {
    const grams = Number(supplies[i]) / 10 ** TOKEN_DECIMALS;
    const navPerGram = Number(pricesE6[i]) / PRICE_E6;
    if (grams > 0 && navPerGram > 0) usd += grams * navPerGram;
  });

  api.addUSDValue(usd);
  return api.getBalances();
}

module.exports = {
  methodology:
    "AUM = on-chain totalSupply (grams) of each Auxite metal token (gold, silver, platinum, palladium) on Base, valued at the per-gram USD NAV read from the AuxiteOracleV2 on-chain oracle. Each token represents 1 gram of allocated physical metal held in custody; on-chain supply equals reserves, with a signed proof-of-reserve attestation posted on Base.",
  base: { tvl },
};
