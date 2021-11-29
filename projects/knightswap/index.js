const { masterChefExports } = require("../helper/masterchef");

const MasterChef = "0xE50cb76A71b0c52Ab091860cD61b9BA2FA407414";
const KNIGHT = "0xd23811058eb6e7967d9a00dc3886e75610c4abba";

module.exports = {
  ...masterChefExports(MasterChef, "bsc", KNIGHT),
  methodology: "TVL includes all farms in MasterChef contract",
}