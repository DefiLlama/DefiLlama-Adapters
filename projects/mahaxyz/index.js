const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs.js');

const eth = {
  // tokens
  dai: ADDRESSES.ethereum.DAI,
  maha: "0x745407c86df8db893011912d3ab28e68b62e49b0",
  usdc: ADDRESSES.ethereum.USDC,
  usdt: ADDRESSES.ethereum.USDT,
  weth: ADDRESSES.ethereum.WETH,
  zai: "0x69000405f9dce69bd4cbf4f2865b79144a69bfe0",

  // peg stability modules
  psmUSDC: '0x69000052a82e218ccb61fe6e9d7e3f87b9c5916f',

  // pools
  zaiUsdcCurve: "0x6ee1955afb64146b126162b4ff018db1eb8f08c3",
  zaiMahaCurve: "0x0086ef314a313018c70a2cd92504c7d1038a25aa",

  // pool staking contracts
  zaiMahaCurveStaking: "0x237efe587f2cb44597063dc8403a4892a60a5a4f",
  zaiUsdcCurveStaking: "0x154F52B347D8E48b8DbD8D8325Fe5bb45AAdCCDa",
};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

const collaterals = [eth.usdc, eth.usdt, eth.dai];
const pegStabilityModules = [eth.psmUSDC]

module.exports = {
  ethereum: {
    pool2: sumTokensExport({
      tokensAndOwners: [
        [eth.zaiMahaCurve, eth.zaiMahaCurveStaking],
        [eth.zaiUsdcCurve, eth.zaiUsdcCurveStaking]
      ]
    }),
    tvl: sumTokensExport({ owners: pegStabilityModules, tokens: collaterals }),
  }
};
