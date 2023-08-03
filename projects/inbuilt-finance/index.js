const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = ADDRESSES.telos.ETH;
const token_USDT = ADDRESSES.moonriver.USDT;
const token_Knit_KFT = ADDRESSES.kava.KFT;
const masterchef = "0x68DB81eAB568174D54F3fd0d9e035eDe9AAEd3e2";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT, ]
    }),
	staking: sumTokensExport({
      owner: masterchef,
      tokens: [token_Knit_KFT]
    })
  }
}
