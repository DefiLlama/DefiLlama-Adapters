const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");
const VECTOR = require("../vector/vectorContracts.json");

const coreModuleProxy = "0xceE74C8c242047c85e6833633AbB7A4Cd8465757";
const xliplessDex = "0x82E90fB94fd9a5C19Bf38648DD2C9639Bde67c74";

const tokens = {
  USDC: {
    pool: "0x94732A5319e1feAcc7d08e08Fdc4C2c7f5123143",
    contractAddr: ADDRESSES.avax.USDC,
  },
  WAVAX: {
    pool: "0x7F91272ff1A0114743D2df95F5905F9613Fd92b3",
    contractAddr: ADDRESSES.avax.WAVAX,
  },
  SAVAX: {
    pool: "0xe57a4042eA63Df072B2cf6352F9779E4D2445A92",
    contractAddr: VECTOR.tokens.SAVAX.address,
  },
  WETH_e: {
    pool: "0xcc7BcEf73d2e57d80d0F42D41088dB2A4C1F9146",
    contractAddr: ADDRESSES.avax.WETH_e,
  },
  COQ: {
    pool: "0xc97d9B3971BfE1B8Ac8EA7f990Df721d8f695223",
    contractAddr: "0x420FcA0121DC28039145009570975747295f2329",
  },
  QI: {
    pool: "0xCfc3d8465cfde6747B8b94968e1893F6E5680045",
    contractAddr: "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5",
  },
  JOE: {
    pool: "0xCB4bd69524A1a398e2112Dc22593F18eD5B3eCD6",
    contractAddr: ADDRESSES.avax.JOE,
  },
  GMX: {
    pool: "0xDBbA61EE0770c99Adc9150c1C98cbd4DEA2F925A",
    contractAddr: "0x62edc0692BD897D2295872a9FFCac5425011c661",
  },
  PNG: {
    pool: "0x0599C838422Ed46681C41b563AAf179a24316F09",
    contractAddr: "0x60781C2586D68229fde47564546784ab3fACA982",
  },
};

let tokenAndOwners = [];
for (const [symbol, token] of Object.entries(tokens)) {
  tokenAndOwners.push([token.contractAddr, token.pool]);
  tokenAndOwners.push([token.contractAddr, coreModuleProxy]);
  tokenAndOwners.push([token.contractAddr, xliplessDex]);
}

module.exports = {
  avax: {
    tvl: sumTokensExport({
      tokensAndOwners: tokenAndOwners,
    }),
  },
};
