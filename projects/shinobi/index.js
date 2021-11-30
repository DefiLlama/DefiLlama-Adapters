const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xba831e62ac14d8500cef0367b14f383d7b1b1b0a) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ubiq: {
    tvl: calculateUsdUniTvl(
      "0xba831e62ac14d8500cef0367b14f383d7b1b1b0a",
      "ubiq",
      "0x1fa6a37c64804c0d797ba6bc1955e50068fbf362",
      [
        //GRANS  
        "0x0826180a4c981d5095cb5c48bb2a098a44cf6f73",
        //ESCH
        "0xcf3222b7fda7a7563b9e1e6c966bead04ac23c36",
        //INK
        "0x7845fcbe28ac19ab7ec1c1d9674e34fdcb4917db",
      ],
      "ubiq"
    ),
  },
};