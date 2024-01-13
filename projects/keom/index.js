const { compoundExports2 } = require('../helper/compound')

const addresses = {
  polygon: {
    comptroller: '0x5B7136CFFd40Eee5B882678a5D02AA25A48d669F',
    cether: '0x7854D4Cfa7d0B877E399bcbDFfb49536d7A14fc7',
  },
  manta: {
    comptroller: '0x91e9e99AC7C39d5c057F83ef44136dFB1e7adD7d',
    cether: '0x8903Dc1f4736D2FcB90C1497AebBABA133DaAC76',
  },
  polygon_zkevm: {
   comptroller: "0x6EA32f626e3A5c41547235ebBdf861526e11f482",
   cether: "0xee1727f5074e747716637e1776b7f7c7133f16b1" 
  }
}
module.exports = {
  polygon: compoundExports2({ ...addresses.polygon, }),
  manta: compoundExports2({ ...addresses.manta, }),
  polygon_zkevm: compoundExports2({ ...addresses.polygon_zkevm, }),
};
