const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs.js");

const linea = {
  weth: ADDRESSES.linea.WETH,
  zero: "0x78354f8DcCB269a615A7e0a24f9B0718FDC3C7A7",
  treasury: "0x14aAD4668de2115e30A5FeeE42CFa436899CCD8A",
};

module.exports = {
  linea: {
    tvl: sumTokensExport({
      owner: linea.treasury,
      chain: "linea",
      tokens: [linea.weth, nullAddress],
    }),
    ownTokens: sumTokensExport({
      owner: linea.treasury,
      tokens: [linea.zero],
      chain: "linea",
    }),
  },
};
