const { compoundExports } = require("../helper/compound");
const { staking } = require("../helper/staking");

const unitroller = "0x4804357AcE69330524ceb18F2A647c3c162E1F95";

module.exports = {
  methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
  kava: {
    ...compoundExports(unitroller, "kava"),
    staking: staking(['0x2c4A1f47c3E15F468399A87c4B41ec0d19297772', '0x194AAd54F363D28aDEaE53A7957d63B9BCf8a6b2'], '0xd86C8d4279CCaFbec840c782BcC50D201f277419')
  },
}