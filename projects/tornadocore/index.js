const { staking, stakings } = require("../helper/staking");
const { pool2, pool2s } = require("../helper/pool2");

/*** Ethereum Addresses ***/
const vaultV1Contract = "0x42A43cD4A19eaBE7775Ea261e4ECAC4CBC2acC3a";
const WETH_TCORE_UNIV2 = "0x39C0eDEf530d284b8f7820061114157C5bD78093";
const TCORE = "0x7A3D5d49D64E57DBd6FBB21dF7202bD3EE7A2253";

/*** BSC Addresses ***/
const vaultContracts_bsc = [
  // Vault V1
  "0x8BE19596c251c6A3d4b490d065F230054e018E21",
  // Vault V2
  "0xbb9FAe76E20683923dfFfAC0f02f03a07e13FbCA",
];
const WBNB_TCORE_BLP = "0x4Ad7b83AdDAc8146ae43eAaAc8051C3aA0587a87";
const WBNB_TCORE_CakeLP = "0x05a509E620869227396E9fb82365D6b418C05eb6";
const TCORE_bsc = "0x40318becc7106364D6C41981956423a7058b7455";

/*** Polygon Addresses ***/
const vaultV1Contract_polygon = "0x40318becc7106364D6C41981956423a7058b7455";
const WMATIC_TCORE_UNIV2_polygon = "0xa109Bae20e8c6bdf84E44B45857e81ad05c8A129";
const TCORE_polygon = "0x4CC5205b9523Fc40E99C20AC7B8Ba0B606c3dbCe";

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(vaultV1Contract, TCORE),
    pool2: pool2(vaultV1Contract, WETH_TCORE_UNIV2),
  },
  bsc: {
    staking: stakings(vaultContracts_bsc, TCORE_bsc),
    pool2: pool2s(
      vaultContracts_bsc,
      [WBNB_TCORE_BLP, WBNB_TCORE_CakeLP],
      "bsc"
    ),
  },
  polygon: {
    staking: staking(vaultV1Contract_polygon, TCORE_polygon),
    pool2: pool2(
      vaultV1Contract_polygon,
      WMATIC_TCORE_UNIV2_polygon,
      "polygon"
    ),
    tvl: (async) => ({}),
  },
  methodology: "Counts liquidty on the staking and pool2 only",
};
