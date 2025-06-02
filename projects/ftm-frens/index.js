const { masterChefExports } = require("../helper/masterchef");

const frens = "0x4cC23f962d872938d478803c4499079517dB2666";
const maserchef = "0x48C2913b014B34979585281df22c6ffbcc53862b";

module.exports = {
    ...masterChefExports(maserchef, "fantom", frens, false)
}