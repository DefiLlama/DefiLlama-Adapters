const { ohmTvl } = require("../helper/ohm");

const treasury = "0xdffb6fb92e3f54c0daa59e5af3f47fd58824562a";
module.exports = ohmTvl(
  treasury,
  [
    //BUSD
    ["0xe9e7cea3dedca5984780bafc599bd69add087d56", false],
    //Pancake LP
    ["0x6b0a3e71b69ab49ddea0ed23bef48f78bf9509aa", true],
  ],
  "bsc",
  "0xfd562672bf1da0f80d43f26bfc4ca19121ba661b",
  "0x8AC9DC3358A2dB19fDd57f433ff45d1fc357aFb3"
);
