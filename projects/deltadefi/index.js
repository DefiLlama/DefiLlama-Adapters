const { sumTokens2 } = require("../helper/chain/cardano");

const SCRIPT_ADDRESS =
  "addr1zy08fkph3vkzh0mqljfnkp22n40k3rnc2avtpswn59dlclkll0mlqdcg2cee0s4ea9vaa9u79xmftptm8akvk55yslks2cqra2";

async function tvl() {
  return sumTokens2({ owners: [SCRIPT_ADDRESS] });
}

module.exports = {
  methodology:
    "TVL counts all assets deposited into DeltaDeFi's on-chain smart contract",
  timetravel: false,
  cardano: {
    tvl,
  },
};
