const { masterChefExports } = require("../helper/masterchef");

// --- BSC Addresses ---
const MasterChefContractBsc = "0xd6D8EBf01b79EE3fC1Ab76Dc3eA79bcB209205E4";
const PEAR_Bsc = "0xdf7c18ed59ea738070e665ac3f5c258dcc2fbad8";

// --- Polygon Addresses ---
const MasterChefContractPolygon = "0xb12FeFC21b12dF492609942172412d4b75CbC709";
const PEAR_Polygon = "0xc8bcb58caEf1bE972C0B638B1dD8B0748Fdc8A44";

// --- Fantom Addresses ---
const MasterChefContractFantom = "0x8c7c3c72205459e4190D9d3b80A51921f2678383";
const PEAR_Fantom = "0x7c10108d4b7f4bd659ee57a53b30df928244b354";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContractBsc, "bsc", PEAR_Bsc, false),
  ...masterChefExports(MasterChefContractPolygon, "polygon", PEAR_Polygon, false),
  ...masterChefExports(MasterChefContractFantom, "fantom", PEAR_Fantom, false),
  methodology:
    "TVL includes all Farms and Pools seccion through MasterChef Contracts",
};
