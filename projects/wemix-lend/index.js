const {compoundExports} = require('../helper/compound');
const { nullAddress } = require('../helper/tokenMapping');

const compound = "0x929620a759a564e3C273e8a4efCDa5806da168F2";
const cETH = "0x34b9B18fDBE2aBC6DfB41A7f6d39B5E511ce3e23";
const chain = "wemix";

module.exports = {
  wemix: compoundExports(compound, chain, cETH, nullAddress),
};