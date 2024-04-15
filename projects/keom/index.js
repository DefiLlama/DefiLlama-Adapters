const { compoundExports2 } = require("../helper/compound");
const { mergeExports } = require("../helper/utils");

const config = {
  polygon_zkevm: [
    {
      comptroller: "0x6EA32f626e3A5c41547235ebBdf861526e11f482",
      cether: "0xee1727f5074e747716637e1776b7f7c7133f16b1",
    },
  ],
  polygon: [
    {
      comptroller: "0x5B7136CFFd40Eee5B882678a5D02AA25A48d669F",
      cether: "0x7854D4Cfa7d0B877E399bcbDFfb49536d7A14fc7",
    },
  ],
  manta: [
    {
      comptroller: "0x91e9e99AC7C39d5c057F83ef44136dFB1e7adD7d",
      cether: "0x8903Dc1f4736D2FcB90C1497AebBABA133DaAC76",
    },
    {
      comptroller: "0xBAc1e5A0B14490Dd0b32fE769eb5637183D8655d",
      cether: "0xd773ffa79258F2D7458F1B74d075F4524Ee3CCa0",
    },
  ],
  astrzk: [
    {
      comptroller: "0xcD906c5f632daFCBD23d574f85294B32E7986fD9",
      cether: "0x79D7c05352a900bE30992D525f946eA939f6FA3E",
    }
  ]
};

const data = [];

Object.values(config).forEach((chain, i) => {
  chain.forEach((item) => {
    data.push({ [Object.keys(config)[i]]: compoundExports2(item) });
  });
});

module.exports = mergeExports(data);