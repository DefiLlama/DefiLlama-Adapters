const { ohmTvl } = require("../helper/ohm");

const ghost = "0xa72eab7327e48bde0ff873eaf1d4fecf6036504f";
const ghostStaking = "0x37076706ee1C549a32103e81DCc3Ee56e6477960";

const treasury = "0x32A0BEfc3092F3740d9D507AA4EC6C9CF0848e2E";
const mim = "0x130966628846bfd36ff31a822705796e8cb8c18d";
const ghostMimJLP = "0x0BC14d02d04dCd6c7a73D1f89d2448F09676a849";

module.exports = {
  misrepresentedTokens: true,
  ...ohmTvl(
    treasury,
    [
      [mim, false],
      [ghostMimJLP, true],
    ],
    "avax",
    ghostStaking,
    ghost,
    undefined,
    undefined,
    false
  ),
};
