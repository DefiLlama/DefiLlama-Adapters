const {masterChefExports} = require("../helper/masterchef");

const token = "0xb2f9a4380ebca7e057db0c4572b7ac90c353ce7d";
const masterchef = "0x5b37fE841b505CEa35Fe93A6c080b5930a8155c0";

module.exports = {
    ...masterChefExports(masterchef, "avax", token, false)
}