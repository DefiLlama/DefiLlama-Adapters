

const { sumTokensExport } = require("./helper/unwrapLPs");




module.exports = {

  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  opbnb: {
    tvl:sumTokensExport({ 
    	owner:'0xC72Be17AFD278F918752bcc3D73a36E1901023BC',
    	tokens:['0x4200000000000000000000000000000000000006','0x8e0c7C33637e0c6BcE51A34e961C04C35aAc2706'],

    }),
  }
};