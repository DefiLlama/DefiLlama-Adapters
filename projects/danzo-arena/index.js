const { sumTokensExport } = require("../helper/chain/cardano");

const scriptAdresses = [
  "addr1vx4caaf06swdn7cdfc7pu3sw235zvuhd02tw2np4uac9mwcp2vt4y", //Danzo Tokens locked inside the address for the DeFi game DANZO ARENA: https://danzo.gg/arena/
  "addr1q8wu9v2wn8hkzq2g7q3ez8a99thw0gwmlhgpc2crmfk982xr2rqrszevgfwunrxu8ajh7pfhmaf6ppj60nj8rnhqhl4srgnekp", //Danzo Tokens locked inside the address for the DeFi game DANZO Game: https://danzo.gg
  "addr1vxherk6ug9235v0mrrmywsr2493sxsydmaylzajs7xavd9q30593r", //Sugar tokens locked inside the address for the DeFi game Sugar Factory: https://sugarcardano.io/factory
"addr1vy3jm4p3s0ufyu4y7zv9jhzzf3uj0j5r9zegkge7gpdt7zgk33jxw",  //Cock tokens locked inside the address for the DeFi game Cock Arena: https://cockcardano.io/arena
"addr1vxqnqk9vfxne3p3ecktnshjjjvyzfxc9pgyf9ux76nrukpq4j73z8",
"addr1vxh2lgfhrd65zer39d5a2lyfsmke9628n4fcu92yvq4ufgcuuy7th",
"addr1v8zyytsux8kg0ues0xd40m9yvghjs6s3vr92ndujq3lxqzscq75s0"
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
