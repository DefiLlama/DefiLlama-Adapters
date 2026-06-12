const { stakings } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

// Panther Protocol v1 vault holds all shielded pool deposits
const vault = "0xDD1fD1a7b4482Dce1287aFFE6Ca8EA128C7a9046";
const ZKP = "0x9A06Db14D639796B25A6ceC6A1bf614fd98815EC";
const zAssets = [
  ADDRESSES.null, // POL
  ZKP,
  ADDRESSES.polygon.QUICK,
  ADDRESSES.polygon.WETH_1,
  ADDRESSES.polygon.WBTC,
  ADDRESSES.polygon.USDC_CIRCLE,
  "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", // LINK
  "0xb33EaAd8d922B1083446DC23f610c2567fB5180f", // UNI
  "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", // AAVE
  "0x5fe2B58c013d7601147DcdD68C143A77499f5531" // GRT
];

const contracts = {
  polygon: {
    core: ZKP,
    staking: [
      "0x4cec451f63dbe47d9da2debe2b734e4cb4000eac",
      "0x5e7fda6d9f5024c4ad1c780839987ab8c76486c9",
    ],
  },
  ethereum: {
    core: "0x909E34d3f6124C324ac83DccA84b74398a6fa173",
    staking: ["0xf4d06d72dacdd8393fa4ea72fdcc10049711f899"],
  },
};

module.exports = {
  methodology: "TVL is the value of assets deposited into the Panther Protocol shielded pool, held by the protocol Vault contract. Staking counts ZKP tokens in the v0 staking contracts.",
  polygon: { tvl: sumTokensExport({ owner: vault, tokens: zAssets })},
  ethereum: { tvl: () => ({}) }
};

for (const [chain, { staking, core }] of Object.entries(contracts)) {
  module.exports[chain].staking = stakings(staking, core)
}
