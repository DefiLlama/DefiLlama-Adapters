const { stakings } = require("../helper/staking.js");
const { getUniTVL } = require("../helper/unknownTokens.js");

const ALMToken = "0x7C38870e93A1f959cB6c533eB10bBc3e438AaC11";
const stakingPool0 = "0x95CDf618b6aF0ec1812290A777955D3609B0508d"; // Strong Holder Pool
const stakingPool1 = "0x4f388167F8B52F89C87A4E46706b9C1408F2c137"; // Old Strong Holder Pool

module.exports = {
  bsc: {
    tvl: getUniTVL({ factory: '0xbEAC7e750728e865A3cb39D5ED6E3A3044ae4B98', useDefaultCoreAssets: true, }),
    staking: stakings([stakingPool0, stakingPool1, ], ALMToken),
  },
};
