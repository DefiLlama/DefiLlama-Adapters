const ADDRESSES = require('../helper/coreAssets.json')
const { ohmTvl } = require("../helper/ohm");

const cakeStaking = "0xA3E4200CA1ac92331d529327E82d89C149CcD81C";
const cake = "0x4eb49a2f9a79053866fae806fac95a3ef5b92c05";

const treasury = "0x829D805F26E26aE6c2C6294B7fF9c0fE14d982Ac";
const treasuryTokens = [
  ["0x130966628846bfd36ff31a822705796e8cb8c18d", false], // MIM
  [ADDRESSES.avax.WAVAX, false], // WAVAX,
  [ADDRESSES.avax.USDT_e, false], // USDT
  [ADDRESSES.avax.WBTC_e, false], // WBTC
  [ADDRESSES.avax.WETH_e, false], // WETH
  ["0x84d2fe6adace63407f4b6bd91ab9f782ba3cb420", true], // CAKE-MIM JLP
  ["0xb8df8111a74e5fd62b13dbbe59ddeb343fc91d4a", true] // CAKE-WAVAX JLP                                                  
]

module.exports = {
  ...ohmTvl(
    treasury,
    treasuryTokens,
    "avax",
    cakeStaking,
    cake
  ),
};

module.exports.deadFrom = '2022-02-01'