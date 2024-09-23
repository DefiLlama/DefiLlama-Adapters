const { sumTokensExport } = require("../helper/chain/cardano");

const scriptAdresses = [
  "addr1vx4caaf06swdn7cdfc7pu3sw235zvuhd02tw2np4uac9mwcp2vt4y", //Danzo Tokens locked inside the address for the DeFi game DANZO ARENA: https://cardanzoada.com/arena/
  "addr1v858vfzl7hdqduqqa4vsj58nfy9njtw5q98q8tzzds58uncqjezd7", //Danzo Tokens locked inside the address for the DeFi game DANZO Game: https://cardanzoada.com/app/#/games
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
