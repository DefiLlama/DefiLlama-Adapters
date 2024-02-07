const { sumTokens2 } = require("../helper/chain/cardano");

const LENDING_SCRIPT = "addr1w8z7wt5leqj5cv9x887a4mw257f63ze4h64cput99cr373qfjgjwn";

async function tvl() {
  return sumTokens2({ scripts: [LENDING_SCRIPT] })
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
