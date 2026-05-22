const { sumTokensExport } = require("../helper/unwrapLPs");

const owners = [ 
  "0x11D75bC93aE69350231D8fF0F5832A697678183E", // Treasury EUR0
];
const tokens = [ 
  "0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80", // euTBL
  "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c", // EURC
];

module.exports = { 
  methodology: "EUR0 is a euro-pegged stablecoin. It is fully backed by EU issued T-Bills.",
  ethereum: {  
    tvl: sumTokensExport({ owners , tokens, resolveUniV3: true }),
  }
}