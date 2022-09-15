const { masterChefExports } = require("./helper/masterchef");

const milko = "0x3c786134228b363fb2984619D7560AB56363B2bD";
const masterchef = "0x5d0C5db1D750721Ed3b13a8436c17e035B44c3D0";

module.exports = {
  ...masterChefExports(masterchef, "milkomeda", milko, false)
};