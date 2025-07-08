const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokensExport } = require("../helper/unwrapLPs");

const poolAddresses_evmos = [
  //NomadBasePoolAddress
  "0x49b97224655AaD13832296b8f6185231AFB8aaCc",
  //CelerBasePool
  "0xbBD5a7AE45a484BD8dAbdfeeeb33E4b859D2c95C",
  //GravityBasePool
  "0xc3f87b7841aE962557d17010b285f8BC3C3d4408",
  // Old DAI Base Pool
  "0xbB3c0ea4Df6C9cd7D0734bb4952D8F27a0361a21",
  // Old USDC Base Pool
  "0x735cad6e573a1963AC381d86bC06a8976BF8F8a6",
  // Old USDT Base Pool
  "0x81f47A9BEE24c48DB0D6aCC8D22446F2aBeeFF26",
  // New DAI Base Pool
  "0x155377C4f5489026cD8340fF350ae6aa082FBE69",
  // New USDC Base Pool
  "0x35bF604084FBE407996c394D3558E58c90281000",
  // New USDT Base Pool
  "0x89E9703309DA4aC51C739D7d674F91489830310E",
];

// Bridged Nomad Stablecoins
const madUSDC = ADDRESSES.evmos.USDC;
const madUSDT = ADDRESSES.evmos.USDT;
const FRAX = ADDRESSES.evmos.FRAX;

// Bridged Celer Stablecoins
const ceDAI = "0x940dAAbA3F713abFabD79CdD991466fe698CBe54";
const ceUSDC = ADDRESSES.evmos.ceUSDC;
const ceUSDT = ADDRESSES.evmos.ceUSDT;

// Bridged Axelar Stablecoins
const axlDAI = "0x4A2a90D444DbB7163B5861b772f882BbA394Ca67";
const axlUSDC = ADDRESSES.evmos.AXL_USDC;
const axlUSDT = "0xe01C6D4987Fc8dCE22988DADa92d56dA701d0Fe0";

// Bridged Gravity Stablecoins
const gravDAI = ADDRESSES.functionx.PUNDIX;
const gravUSDC = ADDRESSES.functionx.PURSE;
const gravUSDT = ADDRESSES.functionx.USDT;

module.exports = {
  evmos: {
    tvl: sumTokensExport({
      owners: poolAddresses_evmos, 
      tokens: [madUSDC, madUSDT, axlDAI, axlUSDC, axlUSDT, ceDAI, ceUSDC, ceUSDT, gravDAI, gravUSDC, gravUSDT, FRAX],
    }),
  },
  methodology:
    "Counts as TVL all the Assets deposited on EVMOS through different Pool Contracts",
};
