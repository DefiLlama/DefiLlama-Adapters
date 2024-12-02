const { sumTokensExport } = require("../helper/chain/cardano");

const scriptAdresses = [
  "addr1vx4caaf06swdn7cdfc7pu3sw235zvuhd02tw2np4uac9mwcp2vt4y", //Danzo Tokens locked inside the address for the DeFi game DANZO ARENA: https://danzo.gg/arena/
  "addr1q8wu9v2wn8hkzq2g7q3ez8a99thw0gwmlhgpc2crmfk982xr2rqrszevgfwunrxu8ajh7pfhmaf6ppj60nj8rnhqhl4srgnekp", //Danzo Tokens locked inside the address for the DeFi game DANZO Game: https://danzo.gg
  "addr1vxherk6ug9235v0mrrmywsr2493sxsydmaylzajs7xavd9q30593r", //Sugar tokens locked inside the address for the DeFi game Sugar Factory: https://sugar.systems/factory
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
