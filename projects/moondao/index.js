const { ohmTvl } = require("../helper/ohm");

const treasury = "0xeC2aE8A3E2692E4b0836AB5cf88104d101DEBEf4";
module.exports = ohmTvl(
  treasury,
  [
    //DAI
    ["0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844", false],
    //USDC
    ["0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d", false],
    //solarbeam LP
    ["0xdbf638d800190271f5473e76898c6c8e741cba51", true],
  ],
  "moonriver",
  "0x534F861B6BaFdF030E5b469D2d763834163f522f",
  "0x761cb807bFbF14A4f4bA980f29F43F009F6a18c0"
);
