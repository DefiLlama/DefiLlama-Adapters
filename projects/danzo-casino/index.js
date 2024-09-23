const { sumTokensExport } = require("../helper/chain/cardano");

const scriptAdresses = [
  "addr1v858vfzl7hdqduqqa4vsj58nfy9njtw5q98q8tzzds58uncqjezd7", //All Tokens locked inside the address for the DeFi game DANZO CASINO: https://cardanzoada.com/app/
];

module.exports = {
  methodology:
    "Calculates the total of idle tokens held in the above mentioned address",
  timetravel: false,
  cardano: {
    tvl: ()=>({}),
    staking: sumTokensExport({ scripts: scriptAdresses }),
  }
};
