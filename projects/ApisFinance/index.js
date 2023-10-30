const { sumTokensExport } = require("../helper/unwrapLPs");

WBNB='0x4200000000000000000000000000000000000006';
APIS='0xf464c09d7f20dc82c6756c65a1ff2e3addfd186b';

module.exports = {

  methodology: 'Summed up  APIS tokens Liquidity  in DEX and all the tokens deposited in their main lending contract.',
  op_bnb: {
    tvl:sumTokensExport({ 
    	owner:'0xa7caf3af138d2f26749a0e6be22c7647b14c7c87',
    	tokens:[WBNB, APIS],

    }),
  }
};
