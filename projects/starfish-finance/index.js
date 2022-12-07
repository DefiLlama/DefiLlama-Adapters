const { staking } = require("../helper/staking.js");
 
const addresses = {
  astar: {
    seanStaking: '0xa86dc743efBc24AF4c1FC5d150AaDb4DCF52c868',
    seanToken: '0xEe8138B3bd03905cF84aFE10cCD0dCcb820eE08E'
  }
}

module.exports = {
  astar: {
    tvl: () => ({}),
    staking: staking(addresses.astar.seanStaking, addresses.astar.seanToken, "astar", 'starfish-finance', 18)
  }
}
