const { compoundExports } = require("./helper/compound");
const { transformMetisAddress } = require("./helper/portedTokens");
const comptroller = "0x92DcecEaF4c0fDA373899FEea00032E8E8Da58Da";

module.exports = {
  timeTravel: true,
  incentivized: true,
  misrepresentedTokens: true,
  methodology: `As in Compound Finance, TVL counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are counted as "Borrowed" TVL and can be toggled towards the regular TVL.`,
  metis: {
    ...compoundExports(
      comptroller,
      "metis",
      "0xE85A1ae1A2A21135c49ADEd398D3FD5Ed032B28e",
      "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000",
      transformMetisAddress()
    ),
  },
};
