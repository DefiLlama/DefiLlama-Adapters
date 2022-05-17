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
  {
    appId: 743679535,
    assetId: 694683000,
    assetDecimals: 6,
    poolAppAddress:
      "WNA4H7Y3UGEVNEVVFU2TUDLMOMLWSV72UF6SYYRBOQ7IGDW4ZIOKYWNIWU",
  },
  {
    appId: 743685742,
    assetId: 701364134,
    assetDecimals: 6,
    poolAppId: 701363946,
  },
];

const liquidGovernanceAppId = 694427622;

const oracleAppId = 735190677;
const oracleAdapterAppId = 743660117;
const oracleDecimals = 14;
const tinymanValidatorAppId = 552635992;

module.exports = {
  pools,
  liquidGovernanceAppId,
  oracleAppId,
  oracleAdapterAppId,
  oracleDecimals,
  tinymanValidatorAppId,
};
