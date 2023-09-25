const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require('../helper/unknownTokens')

const treasury = "0x767d028d6d49ac86Aba52d23746c6dC5285C4852";
const LP = '0x2d593b3472d6a5439bC1523a04C2aec314CBc44c'

module.exports = {
  pulse: {
    tvl: sumTokensExport({ owner: treasury, tokens: [ADDRESSES.pulse.DAI, LP], useDefaultCoreAssets: true, }),
  }
}