const { pool2 } = require("../helper/pool2.js");

const masterchef = "0xa0488F956D7fe05b1798e9FaF0cE5F1133d23822";
const pool2JLP = "0xf070843Ba9ed0ab85B0d15f9E8D67A5A8E073254"; // SMRT-AVAX pool

module.exports = {
  methodology: "TVL calculation currently includes Pool2 TVL in the SMRT-AVAX JLP",
  avax: {
    tvl: async () => ({}),
    pool2: pool2(masterchef, pool2JLP, "avax", (addr) => `avax:${addr}`),
  },
  tvl: async () => ({}),
};
