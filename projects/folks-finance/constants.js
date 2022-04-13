const pools = [
  {
    // Algo
    appId: 686498781,
    assetId: 0,
    assetDecimals: 6,
  },
  {
    // USDC
    appId: 686500029,
    assetId: 31566704,
    assetDecimals: 6,
  },
  {
    // USDt
    appId: 686500844,
    assetId: 312769,
    assetDecimals: 6,
  },
  {
    // goBTC
    appId: 686501760,
    assetId: 386192725,
    assetDecimals: 8,
  },
  {
    // goETH
    appId: 694405065,
    assetId: 386195940,
    assetDecimals: 8,
  },
  {
    // gAlgo3
    appId: 694464549,
    assetId: 694432641,
    assetDecimals: 6,
  },
];

const liquidGovernanceAppId = 694427622;

const oracleAppId = 687039379;
const oracleDecimals = 14;

exports.pools = pools;
exports.liquidGovernanceAppId = liquidGovernanceAppId;
exports.oracleAppId = oracleAppId;
exports.oracleDecimals = oracleDecimals;
