const { sumTokensExport } = require('../helper/unwrapLPs');

const crvPool = "0x20955CB69Ae1515962177D164dfC9522feef567E";
const uad = "0x0F644658510c95CB46955e55D7BA9DDa9E9fBEc6";
const tricrv = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  methodology: "Tokens locked in the Curve Metapool",
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners: [[tricrv, crvPool]] }),
  },
};
