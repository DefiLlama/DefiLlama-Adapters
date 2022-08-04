const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
module.exports = {
  hoo: {
    tvl: calculateUsdUniTvl(
      "0x6168D508ad65D87f8F5916986B55d134Af7153bb",
      "hoo",
      "0xd16babe52980554520f6da505df4d1b124c815a7",
      [
        "0x3eff9d389d13d6352bfb498bcf616ef9b1beac87", // wHOO token
        "0xbe8d16084841875a1f398e6c3ec00bbfcbfa571b", // Pudding
      ]
    ),
  }
}
