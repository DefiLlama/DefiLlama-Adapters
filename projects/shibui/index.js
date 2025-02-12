const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");


const Boba_SHIBUI = "0xf08ad7c3f6b1c6843ba027ad54ed8ddb6d71169b";

const Boba_SHIBUI_USDT = "0x3f714fe1380ee2204ca499d1d8a171cbdfc39eaa";



module.exports = {
  boba: {
    tvl: () => ({}),
    pool2: pool2s([
      "0x6b8f4Fa6E44e923f5A995A87e4d79B3Bb9f8aaa3", // SHIBUI-USDT<>WAGMIv3
    ], [Boba_SHIBUI_USDT]),
    staking: staking("0xabAF0A59Bd6E937F852aC38264fda35EC239De82", Boba_SHIBUI),
  },
}
