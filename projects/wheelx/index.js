const { sumTokensExport } = require('../helper/unwrapLPs');

// wheelx solver address
const WHEELX_SOLVER = "0x4fd0FC39eb0d56FE8250496DbFC81c39B1021ac6";

module.exports = {
  methodology: "Counts the native token (Gas/ETH) balance deposited in the wheelx solver address.",
  megaeth: {
    tvl: sumTokensExport({ 
        owner: WHEELX_SOLVER, 
        tokens: [
            "0x0000000000000000000000000000000000000000" // Null address = Native ETH
        ]
    })
  }
};
