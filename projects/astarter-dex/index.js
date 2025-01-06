const { sumTokens2 } = require("../helper/chain/cardano");

const DEX_BATHCER_SCRIPT = "addr1wxz9n9rwqfld9ahctdjl3ldhsck22vsuuwmmv8mpsll74lgue5r6h";
const DEX_POOL_SCRIPT = "addr1w896t3nhplnmxr4ur73j7qvn3s2s2yepzdsda536cahrdvcq37n5x";

async function tvl() {
  return sumTokens2({ scripts: [DEX_BATHCER_SCRIPT, DEX_POOL_SCRIPT], blacklistedTokens: [
    'a221955d11877502db596bad11a549eb41cd56279092e45b7e4abfe94279726f6e', // Byron 
    'a221955d11877502db596bad11a549eb41cd56279092e45b7e4abfe95368656c6c6579', // shelly
  ] })
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
  }
};
