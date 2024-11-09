const { sumTokensExport } = require("../helper/unwrapLPs");
const DE_TOKEN_ADDRESS = '0x081Ec4c0e30159C8259BAD8F4887f83010a681DC';

const owners = [
  '0x6261e1aac369cd694093455f9e2b65b31acedda1', // veDE
  '0x1a9b54A3075119f1546C52cA0940551A6ce5d2D0', // Payments for DeNet storage
]

module.exports = {
  start: 1691761595, // Friday, 11-Aug-23 13:46:35 UTC	
  methodology: "Total amount of DE tokens used for DeNet storage payments",
    
  polygon: {
	tvl: () => ({}),
    staking: sumTokensExport({ 
      owners: owners,
      tokens: [DE_TOKEN_ADDRESS]
    }),
  }
};

 // LLAMA_DEBUG_MODE="true" node test.js projects/DeNet/index.js
