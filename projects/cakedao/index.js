const { ohmTvl } = require("../helper/ohm");

const cakeStaking = "0xA3E4200CA1ac92331d529327E82d89C149CcD81C";
const cake = "0x4eb49a2f9a79053866fae806fac95a3ef5b92c05";

const treasury = "0x829D805F26E26aE6c2C6294B7fF9c0fE14d982Ac";
const mim = "0x130966628846bfd36ff31a822705796e8cb8c18d";
const wavax = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
const cakeMimJLP = "0x84d2fe6adace63407f4b6bd91ab9f782ba3cb420";

module.exports = {
  ...ohmTvl(
    treasury,
    [
      [mim, false],
      [wavax, false],
      [cakeMimJLP, true],
    ],
    "avax",
    cakeStaking,
    cake,
    undefined,
    undefined,
    false
  ),
};
