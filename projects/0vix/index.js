const ADDRESSES = require('../helper/coreAssets.json')
const {compoundExports2} = require('../helper/compound')

const master0vix = "0x8849f1a0cB6b5D6076aB150546EddEe193754F1C";
const oMATIC = "0xE554E874c9c60E45F1Debd479389C76230ae25A8";
const matic = ADDRESSES.polygon.WMATIC_2;
const chain = "polygon";

module.exports = {
  hallmarks: [
    [Math.floor(new Date('2023-04-28')/1e3), 'Protocol was hacked!'],
  ],
  polygon: compoundExports2({ comptroller: master0vix, cether: oMATIC, }),
  polygon_zkevm: compoundExports2({ comptroller: "0x6EA32f626e3A5c41547235ebBdf861526e11f482", cether: '0xee1727f5074e747716637e1776b7f7c7133f16b1' }),
};

delete module.exports.polygon.borrowed