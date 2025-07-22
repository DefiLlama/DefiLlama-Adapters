const abi = require("./omni.json");
const { aaveExports, methodology, } = require("../helper/aave");

const validProtocolDataHelper = "0x8AAc97e25c79195aC77817287Cf512b0Acc9da44";
const omniOracle = "0x08Eaf1C8c270a485DD9c8aebb2EDE3FcAe72e04f";

module.exports = {
  misrepresentedTokens: true,
  methodology,
  ethereum: aaveExports('ethereum', undefined, undefined, [validProtocolDataHelper],  { oracle: omniOracle, 
  abis: {
    getAllATokens: abi.getAllOTokens,
  }}),
  hallmarks: [
    ['2022-07-10', 'reentrancy hack'],
  ],
  deadFrom: '2022-07-10',
};

module.exports.ethereum.borrowed = () => ({}) // bad debt