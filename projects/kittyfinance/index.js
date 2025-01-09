const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");

const avaxCat = "0x094BFaC9894d2A2A35771D0BD6d2447689190F32";
const polyCat = "0xB932D203f83B8417Be0F61D9dAFad09cc24a4715";
const polyChef = "0xc17c09f7615c660dd5A7C1051E096240CF75685a";
const avaxChef = "0xb7e2eBb3E667A542cDd07e8d108D5fF618315a18";
const avaxNursery = "0xDB75c7b1f8D54Fd02C456609F985F5229634429A";
const polyNursery = "0xA87b3c515C5D50AF8c876709e2A92e5859cd198B";
const polyLPs = [
  "0xcA75C4aA579c25D6ab3c8Ef9A70859ABF566fA1d", // KITTY-MATIC LP
  "0x3C443ca1c986258bEb416cC35FAE95060Ac4Ab13", //CAT-MATIC LP
];
const avaxLPs = [
  "0xbC61C7eCEf56E40404fC359ef4dfd6E7528f2B09", // KITTY-AVAX LP
  "0x2d9A57C484C60241f5340a145a3004c7E4cfE040", // CAT-AVAX LP
];

module.exports = {
  polygon: {
    tvl: async () => ({}),
    pool2: pool2(polyChef, polyLPs),
    staking: staking(polyNursery, polyCat),
  },
  avax: {
    tvl: async () => ({}),
    pool2: pool2(avaxChef, avaxLPs),
    staking: staking(avaxNursery, avaxCat),
  },
};
