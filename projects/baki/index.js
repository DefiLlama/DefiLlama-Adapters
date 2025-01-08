const bakiAddress = "0x1209c35BDA1bC7b9edaF4C2f60Aa034B0530240b";
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Total collateral deposited on Baki",
  avax: {
    tvl: sumTokensExport({ owner: bakiAddress, tokens: [ADDRESSES.avax.USDC] })
  },
};
