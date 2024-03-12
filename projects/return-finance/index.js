const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

// AAVE V3 Polygon
const ownerPolygon = "0x3B6385493a1d4603809dDbaE647200eF8baA53F5";
const tokensPolygon = [
  ADDRESSES.polygon.USDC,
  "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
];

// AAVE V3 - Avalanche
const ownerAvax = "0x3B6385493a1d4603809dDbaE647200eF8baA53F5";
const tokensAvax = ["0x625E7708f30cA75bfd92586e17077590C60eb4cD"];

// Compound V3 - Base
const ownerBase = "0x3B6385493a1d4603809dDbaE647200eF8baA53F5";
const tokensBase = ["0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf"];

// MakerDAO - Ethereum
const ownerMaker = "0x201254227f9fE57296C257397Be6c617389a8cCb";

// Convex Finance - Ethereum
const ownerConvex = "0xFD360A096E4a4c3C424fc3aCd85da8010D0Db9a5";

const tokensETH = [
  "0x201254227f9fE57296C257397Be6c617389a8cCb",
  "0xFD360A096E4a4c3C424fc3aCd85da8010D0Db9a5",
];

module.exports = {
  methodology: "Track funds locked in protocols",
  polygon: {
    tvl: sumTokensExport({ owner: ownerPolygon, tokens: tokensPolygon }),
  },
  avax: {
    tvl: sumTokensExport({ owner: ownerAvax, tokens: tokensAvax }),
  },
  base: {
    tvl: sumTokensExport({ owner: ownerBase, tokens: tokensBase }),
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: [ownerMaker, ownerConvex],
      tokens: tokensETH,
    }),
  },
};
