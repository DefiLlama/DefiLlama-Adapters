const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");
const VECTOR = require("../vector/vectorContracts.json");

const tokens = {
  COQ: "0x420FcA0121DC28039145009570975747295f2329",
};
const coreModuleProxy = "0xceE74C8c242047c85e6833633AbB7A4Cd8465757";
const pools = {
  WAVAX: "0x7F91272ff1A0114743D2df95F5905F9613Fd92b3",
  USDC: "0x94732A5319e1feAcc7d08e08Fdc4C2c7f5123143",
  COQ: "0xc97d9B3971BfE1B8Ac8EA7f990Df721d8f695223",
  SAVAX: "0xe57a4042eA63Df072B2cf6352F9779E4D2445A92",
  core: "0xceE74C8c242047c85e6833633AbB7A4Cd8465757",
};

module.exports = {
  avax: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.avax.WAVAX, pools.WAVAX],
        [ADDRESSES.avax.USDC, pools.USDC],
        [tokens.COQ, pools.COQ],
        [VECTOR.tokens.SAVAX.address, pools.SAVAX],
        [ADDRESSES.avax.WAVAX, coreModuleProxy],
        [ADDRESSES.avax.USDC, coreModuleProxy],
        [tokens.COQ, coreModuleProxy],
        [VECTOR.tokens.SAVAX.address, coreModuleProxy],
      ],
    }),
  },
};
