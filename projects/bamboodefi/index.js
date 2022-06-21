const sdk = require("@defillama/sdk");
const { uniTvlExport } = require("../helper/calculateUniTvl.js");
const { getChainTransform } = require("../helper/portedTokens");

const factoryETH = "0x3823Ac41b77e51bf0E6536CE465479cBdedcaEa9";
const factoryBSC = "0xFC2604a3BCB3BA6016003806A288E7aBF75c8Aa3";
const factoryPolygon = "0x25cc30af6b2957b0ed7ceca026fc204fdbe04e59";
const factoryVelas = "0xFC2604a3BCB3BA6016003806A288E7aBF75c8Aa3";

module.exports = {
  misrepresentedTokens: false,
  timetravel: true,
  methodology:
    "TVL is calculated from the Bamboo DeFi factory smart contracts on each chain.",
  bsc: {
    tvl: uniTvlExport(factoryBSC, "bsc"),
  },
  ethereum: {
    tvl: uniTvlExport(factoryETH, "ethereum"),
  },

  polygon: {
    tvl: uniTvlExport(factoryPolygon, "polygon"),
  },
  velas: {
    tvl: uniTvlExport(factoryVelas, "velas", () => getChainTransform("velas")),
  },
}
