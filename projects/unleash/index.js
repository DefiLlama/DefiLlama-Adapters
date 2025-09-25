const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  sty: aaveExports('sty', '0xe80c9a1D69cd3EE13A65BFA84C6Bb4Af7130D3a1', undefined, ['0x970C24ABaEA0dddf1b1C328237001c74Bb96c9e4'], { v3: true, } ),
}
