const { ohmTvl } = require("../helper/ohm");

const treasury = "0xE8E6a534146EFdCAdB64C4ce78600E5C9e71fc97";
const stakingContract = "0xc9ecFeF2fac1E38b951B8C5f59294a8366Dfbd81";
const umami = "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3";

//Treasury tokens
const frax = "0x17fc002b466eec40dae837fc4be5c67993ddbd6f";
const mim = "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a";
const weth = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
const wbtc = "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f";
const gohm = "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1";
const umamiMim = "0xcE502EE9bf3eF41508A8a4A38fcF02585FcbFDf0";

module.exports = {
  ...ohmTvl(
    treasury,
    [
      [frax, false],
      [mim, false],
      [weth, false],
      [wbtc, false],
      [gohm, false],
      [umamiMim, true],
    ],
    "arbitrum",
    stakingContract,
    umami
  ),
};
