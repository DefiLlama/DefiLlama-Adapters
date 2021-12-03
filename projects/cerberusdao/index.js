const { ohmTvl } = require("../helper/ohm");

const treasury = "0x56D595ea5591D264bc1Ef9E073aF66685F0bFD31";
module.exports = ohmTvl(
  treasury,
  [
    //SHIB
    ["0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", false],
    //uniswap LP shib/weth
    ["0xb5b6c3816c66fa6bc5b189f49e5b088e2de5082a", true],
  ],
  "ethereum",
  "0x95deaF8dd30380acd6CC5E4E90e5EEf94d258854",
  "0x8a14897eA5F668f36671678593fAe44Ae23B39FB"
);
