const { uniV3MultipleFactoriesExport } = require("./utils");

module.exports = uniV3MultipleFactoriesExport({
  linea: [
    {
      factory: "0x9Fe607e5dCd0Ea318dBB4D8a7B04fa553d6cB2c5",
      fromBlock: 1150,
    },
    {
      factory: "0xec4f2937e57a6F39087187816eCc83191E6dB1aB",
      fromBlock: 3395601,
      isAlgebra: true,
    }
  ],
  base: [
    {
      factory: "0x07AceD5690e09935b1c0e6E88B772d9440F64718",
      fromBlock: 2053334,
    }
  ],
});
