const {compoundExports} = require('../helper/compound')

const master0vix = "0x8849f1a0cB6b5D6076aB150546EddEe193754F1C";
const oMATIC = "0xE554E874c9c60E45F1Debd479389C76230ae25A8";
const matic = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
const chain = "polygon";

module.exports = {
  polygon: compoundExports(master0vix, chain, oMATIC, matic),
};