const { sumTokens2 } = require("../helper/sumTokens");

const BETTING_PLATFORM = "0x4d83eab83defa9e2488b3c525f54fc588185cfc1a906e5dada1954bf52296e76";

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [BETTING_PLATFORM],
  });
}

module.exports = {
  methodology: "TVL is calculated by summing all SUI and SBETS tokens locked in the SuiBets betting platform treasury.",
  sui: {
    tvl,
  },
};
