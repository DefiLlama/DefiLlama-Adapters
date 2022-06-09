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
    // Algo-gAlgo3 TMP1.1
    appId: 743679535,
    assetId: 694683000,
    assetDecimals: 6,
    poolAppAddress:
      "WNA4H7Y3UGEVNEVVFU2TUDLMOMLWSV72UF6SYYRBOQ7IGDW4ZIOKYWNIWU",
  },
  {
    // Algo-gAlgo3 PLP
    appId: 743685742,
    assetId: 701364134,
    assetDecimals: 6,
    poolAppId: 701363946,
  },
  {
    // Algo-USDC TMP1.1
    appId: 747237154,
    assetId: 552647097,
    assetDecimals: 6,
    poolAppAddress:
      "FPOU46NBKTWUZCNMNQNXRWNW3SMPOOK4ZJIN5WSILCWP662ANJLTXVRUKA",
  },
  {
    // Algo-USDC PLP
    appId: 747239433,
    assetId: 620996279,
    assetDecimals: 6,
    poolAppId: 620995314,
  },
  {
    // Planets
    appId: 751285119,
    assetId: 27165954,
    assetDecimals: 6,
  },
];

const liquidGovernanceAppId = 694427622;

const oracleAppId = 751491670;
const oracleAdapterAppId = 751277258;
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
