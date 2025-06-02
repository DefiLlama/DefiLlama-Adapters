const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = ADDRESSES.telos.ETH;
const token_USDT = ADDRESSES.moonriver.USDT;
const masterchef = "0x68DB81eAB568174D54F3fd0d9e035eDe9AAEd3e2";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT, ]
    }),
	staking: sumTokensExport({
      owner: masterchef,
      tokens: ['0xa0eeda2e3075092d66384fe8c91a1da4bca21788']
    })
  }
}
