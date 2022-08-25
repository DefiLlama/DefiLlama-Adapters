/*==================================================
  Modules
  ==================================================*/
const axios = require("axios");
const BigNumber = require("bignumber.js");


/*==================================================
  TVL
  ==================================================*/

async function tvl() {

  const { data: tvl } = await axios.get("https://raw.githubusercontent.com/mobiusAMM/TVLRegistry/master/data/tvl.json");

  console.log(Math.round(tvl));

  return  new BigNumber(Math.round(tvl));
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  start: 8606077, // January 19, 2021 11:51:30 AM
  celo: { fetch: tvl },
  fetch: tvl
};

///
