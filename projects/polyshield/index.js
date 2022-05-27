const { masterChefExports } = require("../helper/masterchef");

const MasterChef = "0x0Ec74989E6f0014D269132267cd7c5B901303306";
const SHI3LD = "0xf239e69ce434c7fb408b05a0da416b14917d934e";

module.exports = {
  ...masterChefExports(MasterChef, "polygon", SHI3LD),
  methodology: "TVL includes all farms and vaults in MasterChef contract",
}