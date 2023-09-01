const { sumTokens2 } = require("../helper/chain/cardano");

const DEX_BATHCER_SCRIPT = "addr1wxvf6xqa3jkq9cnyjnf7t4v6aku75rn3l3mlhe9udp4dnwcjscuah";
const DEX_POOL_SCRIPT = "addr1wxe4dwl0jmmchjnd049t5ur7lc4jmhcjax8ht393evxcjsgeccdeu";

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
