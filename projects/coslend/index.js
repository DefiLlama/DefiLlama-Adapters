const { usdCompoundExports } = require("../helper/compound");
module.exports = {
  evmos: usdCompoundExports(
    "0x2C8b48Dc777C26dc857E1040D8ef3Bdd3B1ef499",
    "evmos",
    undefined, undefined, {
      blacklist: [
        '0x269bd2505045947d410582128bc65105d285e66e', // MockToken
      ]
    }
  ),
};
