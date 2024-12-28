const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");


const MM3BasePool = "0x61bB2F4a4763114268a47fB990e633Cb40f045F8";
const DAI = "0xF2001B145b43032AAF5Ee2884e456CCd805F677D";
const USDT = ADDRESSES.cronos.USDT;
const USDC = ADDRESSES.cronos.USDC;


module.exports = {
  doublecounted: true,
  cronos: {
    tvl: sumTokensExport({ tokens: [DAI, USDC, USDT], owner: MM3BasePool }),
  },
  methodology: "Counts DAI, USDC, & USDT tokens on the 3MM Base Pool for tvl",
};
