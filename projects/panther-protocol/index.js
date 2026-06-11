const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

// Panther Protocol v1 vault holds all shielded pool deposits
const vault = "0xDD1fD1a7b4482Dce1287aFFE6Ca8EA128C7a9046";
const zAssets = [
  nullAddress, // POL
  "0x9A06Db14D639796B25A6ceC6A1bf614fd98815EC", // ZKP
  "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", // LINK
  "0xb33EaAd8d922B1083446DC23f610c2567fB5180f", // UNI
  "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", // AAVE
  "0x5fe2B58c013d7601147DcdD68C143A77499f5531", // GRT
  "0xB5C064F955D8e7F38fE0460C556a72987494eE17", // QUICK
  "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH
  "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", // WBTC
  "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
];

module.exports = {
  methodology:
    "TVL is the value of assets deposited into the Panther Protocol shielded pool, held by the protocol Vault contract.",
  polygon: {
    tvl: sumTokensExport({ owner: vault, tokens: zAssets }),
  },
};
