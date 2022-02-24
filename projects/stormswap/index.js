const { masterChefExports } = require("../helper/masterchef");

const masterChefContractStorm_avax =
  "0xc1A97bCbaCf0566fc8C40291FFE7e634964b0446";
const storm = "0x6AFD5A1ea4b793CC1526d6Dc7e99A608b356eF7b";

const masterChefContractWave_avax =
  "0x81a6E8CCaa786A5a92496C871b5567f2Ee940a12";
const wave = "0x35d833281a098760f7361dbfc8a3d5c4d4da5b66";

const masterChefContractWind_cronos =
  "0x6eC89CCcDb563Ac442d2370F6E47bC1C78e023fC";
const wind = "0x48713151e5afb7b4cc45f3653c1c59cf81e88d4b";

module.exports = {
  ...masterChefExports(masterChefContractStorm_avax, "avax", storm),
  ...masterChefExports(masterChefContractWind_cronos, "cronos", wind),
  //...masterChefExports(masterChefContractWave_avax, "avax", wave),
  methodology:
    "We count liquidity on the Fields (LP tokens) and Lagoons(single tokens) sections through MasterChef Contracts",
};
