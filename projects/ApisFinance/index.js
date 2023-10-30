const { sumTokensExport } = require("../helper/unwrapLPs");

WBNB='0x4200000000000000000000000000000000000006';
APIS='0x8e0c7C33637e0c6BcE51A34e961C04C35aAc2706';

module.exports = {

  methodology: 'Summed up  APIS tokens Liquidity  in DEX and all the tokens deposited in their main lending contract.',
  op_bnb: {
    tvl:sumTokensExport({ 
    	owner:'0xa7caf3af138d2f26749a0e6be22c7647b14c7c87',
    	tokens:[WBNB, APIS],

    }),
  }
};
