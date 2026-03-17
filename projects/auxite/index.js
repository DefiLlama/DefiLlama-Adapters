const { toUSDTBalances } = require("../helper/balances");

const AUXG = "0x390164702040B509A3D752243F92C2Ac0318989D";
const AUXS = "0x82F6EB8Ba5C84c8Fd395b25a7A40ade08F0868aa";
const AUXPT = "0x119de594170b68561b1761ae1246C5154F94705d";
const AUXPD = "0xe051B2603617277Ab50C509F5A38C16056C1C908";

const ORACLE = "0xDB36fFD8a762226928d62a2Fe6F19bB329b5EbbE";

// keccak256("GOLD"), keccak256("SILVER"), etc.
const METAL_IDS = [
  "0xdbd17891fc491ac6717dd01ab1f90f82509f1f2e91cd5066f68805860fbdeb72",
  "0x75e02a3ee626f5d4b8bc98cc8de5b102ee067608b6066832ffdc71f78445ac2b",
  "0xecbba860b0e9fdd311c554f0b28ccf3d616b99de2f208aa830a91bd846d16657",
  "0x06be24fb53be069d32979b5b3d41617a459d2f6b1b018dd945ebb5b9dc321d15",
];

async function tvl(api) {
  const tokens = [AUXG, AUXS, AUXPT, AUXPD];

  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: tokens,
  });

  const pricesE6 = await api.multiCall({
    abi: "function getBasePerKgE6(bytes32) external view returns (uint256)",
    calls: METAL_IDS.map((id) => ({ target: ORACLE, params: [id] })),
  });

  // supply: grams with 3 decimals, price: USD/kg with 6 decimals
  // USD = (supply / 1e3) * (priceE6 / 1e6 / 1000)
  let totalUsd = 0;
  for (let i = 0; i < tokens.length; i++) {
    const grams = Number(supplies[i]) / 1e3;
    const usdPerGram = Number(pricesE6[i]) / 1e9;
    totalUsd += grams * usdPerGram;
  }

  return toUSDTBalances(totalUsd);
}

module.exports = {
  methodology:
    "TVL is calculated from the total supply of Auxite metal tokens (AUXG, AUXS, AUXPT, AUXPD) on Base, priced via the on-chain Auxite oracle. Each token represents 1 gram of physically allocated precious metal.",
  base: { tvl },
};
