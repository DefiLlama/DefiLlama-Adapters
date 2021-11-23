const { masterChefExports } = require("../helper/masterchef");

// --- BSC Addresses ---
const MasterChefContractBsc = "0x8E934F14bD904A46e0C8aF7de6aEeAaaa0D8C2c5";
const CGS_Bsc = "0x26d88b1e61e22da3f1a1ba95a1ba278f6fcef00b";

// --- Polygon Addresses ---
const MasterChefContractPolygon = "0x9bFcf65e7De424a6D89Eef23B3dF8cdc965c654F";
const CGS_Polygon = "0x047fD3B3D2366F9babe105ade4598E263d6c699c";

// --- Fantom Addresses ---
const MasterChefContractFantom = "0x1CA27c8f19EF84F5f5A9cf2E2874E4Bf91fD38C4";
const CGS_Fantom = "0x5a2e451fb1b46fde7718315661013ae1ae68e28c";

// --- Harmony Addresses ---
const MasterChefContractHarmony = "0x1357521115A4dAA6524045215ac7F979e64d6079";
const CGS_Harmony = "0x6cc35220349c444c39b8e26b359757739aaec952";

// --- Avalanche Addresses ---
const MasterChefContractAvax = "0xa127A67D1429B3f8d33a4E0398347661c3737a12";
const CGS_Avax = "0x727C43b707C6Fe3ACD92f17EFAC8e05476DFa81c";

module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContractBsc, "bsc", CGS_Bsc),
  ...masterChefExports(MasterChefContractPolygon, "polygon", CGS_Polygon),
  ...masterChefExports(MasterChefContractFantom, "fantom", CGS_Fantom),
  ...masterChefExports(MasterChefContractHarmony, "harmony", CGS_Harmony),
  ...masterChefExports(MasterChefContractAvax, "avax", CGS_Avax),
  methodology:
    "TVL includes all Farms and Pools seccion through MasterChef Contracts",
};
