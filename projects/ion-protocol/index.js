const { ionProtocolExports } = require("../helper/ionProtocol");
module.exports = ionProtocolExports({
  ethereum: {
    markets: {
      // weETH/wstETH Market
      "0x0000000000eaEbd95dAfcA37A39fd09745739b78":
        "0x3f6119B0328C27190bE39597213ea1729f061876", // weETH/wstETH GemJoin
      // rsETH/wstETH Market
      "0x0000000000E33e35EE6052fae87bfcFac61b1da9":
        "0x3bC3AC09d1ee05393F2848d82cb420f347954432", // rsETH/wstETH GemJoin
      // rswETH/wstETH Market
      "0x00000000007C8105548f9d0eE081987378a6bE93":
        "0xD696f9EA3299113324B9065ab19b70758256cf16", // rswETH/wstETH GemJoin
    },
  },
});
