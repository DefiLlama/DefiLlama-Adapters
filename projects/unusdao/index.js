const { ohmTvl } = require("../helper/ohm");

const udo = "0xB91Ec4F9D7D12A1aC145A7Ae3b78AFb45856C9c8";
const treasuryContract = "0x01CDdb5C0986B8521F93A9A5C6d84D6994a82742";
const stakingContract = "0xC34AF465Aac5928afec7e3642BD8Ca7873a7F2b2";

const busd = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const usdt = "0x55d398326f99059ff775485246999027b3197955";
const udoBusd = "0x364952dC20b5720b7fd3e73141cF6A85d9af8643";

module.exports = {
  ...ohmTvl(
    treasuryContract,
    [
      [busd, false],
      [usdt, false],
      [udoBusd, true],
    ],
    "bsc",
    stakingContract,
    udo
  ),
};
