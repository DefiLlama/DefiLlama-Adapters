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

// --- Cronos Addresses ---
const MasterChefContractCronos = "0x07586393ed706e5dBf637195d8cf22F5844F234e";
const CGS_Cronos = "0x4e57e27e4166275Eb7f4966b42A201d76e481B03";

// --- Moonbeam Addresses ---
const MasterChefContractMoonbeam = "0xc5C772e21A39f88f0960172016Cf455Da6fF52Af";
const CGS_Moonbeam = "0x2Dfc76901bB2ac2A5fA5fc479590A490BBB10a5F";

// --- Arbitrum Addresses ---
const MasterChefContractArbitrum = "0xd619f601404a2406b5d93f6ff9A9465BbBDA73cc";
const CGS_Arbitrum = "0x5cb91B0b2d2C80c7104b04E134B43b89b4d2f98A";


module.exports = {
  misrepresentedTokens: true,
  ...masterChefExports(MasterChefContractBsc, "bsc", CGS_Bsc),
  ...masterChefExports(MasterChefContractPolygon, "polygon", CGS_Polygon),
  ...masterChefExports(MasterChefContractFantom, "fantom", CGS_Fantom),
  ...masterChefExports(MasterChefContractHarmony, "harmony", CGS_Harmony),
  ...masterChefExports(MasterChefContractAvax, "avax", CGS_Avax),
  ...masterChefExports(MasterChefContractCronos, "cronos", CGS_Cronos, false),
  ...masterChefExports(MasterChefContractMoonbeam, "moonbeam", CGS_Moonbeam, false),
  ...masterChefExports(MasterChefContractArbitrum, "arbitrum", CGS_Arbitrum, false),
  methodology:
    "TVL includes all Farms and Pools seccion through MasterChef Contracts"
};
