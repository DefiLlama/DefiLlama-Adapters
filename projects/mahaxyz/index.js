const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs.js");
const { staking } = require("../helper/staking");

const eth = {
  // tokens
  dai: ADDRESSES.ethereum.DAI,
  maha: "0x745407c86df8db893011912d3ab28e68b62e49b0",
  usdc: ADDRESSES.ethereum.USDC,
  susde: ADDRESSES.ethereum.sUSDe,
  usdt: ADDRESSES.ethereum.USDT,
  weth: ADDRESSES.ethereum.WETH,
  zai: "0x69000dFD5025E82f48Eb28325A2B88a241182CEd",
  szai: "0x69000195D5e3201Cf73C9Ae4a1559244DF38D47C",

  // peg stability modules
  psmUSDC: "0x69000052a82e218ccb61fe6e9d7e3f87b9c5916f",
  psmsUSDe: "0x7DCdE153e4cACe9Ca852590d9654c7694388Db54",

  // pools
  zaiUsdcCurve: "0x4a0c954d0f19269f4fc5c217821c6150a8870ad4",
  zaiMahaCurve: "0x7d2dffa9e903b8377c96196da424c7965b06bcc3",
  zaiSzaiCurve: "0x53ad9268a66cef20a4c458d759eee5aa55be1140",

  // pool staking contracts
  zaiMahaCurveStaking: "0xE2EbBf803d0199A5A26108bA36FBAc366b201Be1",
  zaiUsdcCurveStaking: "0xdFB06C4c562Bcc810C112FBAC99c59C2856b86D1",
  zaiSzaiCurveStaking: "0xfDAeB792FF19e7bd4f7ED5d6ce2ef7925d002A19",
};

const base = {
  usdc: ADDRESSES.base.USDC,
  maha: "0x554bba833518793056CF105E66aBEA330672c0dE",
  mahax: "0x7DF7505aa7cfAb3AC1A8D1EC225f2fafe5f04c74",
  zai: "0x69000dFD5025E82f48Eb28325A2B88a241182CEd",
  szai: "0x69000195D5e3201Cf73C9Ae4a1559244DF38D47C",

  // pools
  zaiUsdcAerodrome: "0x93EdC603D7A2eA03518Ac55219cAD320010a58e4",
  zaiMahaAerodrome: "0x96A0EC12A9F3bEabFf9Bb59c3F33EE439dAF2a85",
  zaiMahaV3Aerodrome: "0xebF0D2faC88448874947550FA9B2A75f22FF571F",

  // staking contracts
  zaiUsdcStaking: "0xD87ECeF739161be77bbe9891dBA80F14275BBE34",
  zaiMahaStaking: "0xe77b404e934c1d97f179061349F459847f70Cd8C",

  gnosis: "0x7202136d70026DA33628dD3f3eFccb43F62a2469",
};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

const collaterals = [eth.usdc, eth.susde];
const pegStabilityModules = [eth.psmsUSDe];

module.exports = {
  ethereum: {
    pool2: sumTokensExport({
      tokensAndOwners: [
        [eth.zaiMahaCurve, eth.zaiMahaCurveStaking],
        [eth.zaiUsdcCurve, eth.zaiUsdcCurveStaking],
        [eth.zaiSzaiCurve, eth.zaiSzaiCurveStaking],
      ],
      resolveLP: true,
    }),
    tvl: sumTokensExport({ owners: pegStabilityModules, tokens: collaterals }),
  },
  base: {
    pool2: sumTokensExport({
      tokensAndOwners: [
        [base.zaiMahaAerodrome, base.zaiMahaStaking],
        [base.zaiUsdcAerodrome, base.zaiUsdcStaking],
      ],
      resolveLP: true,
    }),
    staking: staking(base.mahax, base.maha),
  },
};
