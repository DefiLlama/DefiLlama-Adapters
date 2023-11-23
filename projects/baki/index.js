const bakiAddress = "0x98e76679064d50a45647c452a0b2c4cb1137f28c";
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  methodology: "Total collateral deposited on Baki",
  avax: {
    tvl: sumTokensExport({ owner: bakiAddress, tokens: [ADDRESSES.avax.USDC] })
  },
};
