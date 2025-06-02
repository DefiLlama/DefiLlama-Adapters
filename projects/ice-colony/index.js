const {masterChefExports} = require("../helper/masterchef");
const masterchef = "0xFa0A21fFCd1BB6210160582Cd9E42C7E90668F83";
const ice = "0x6ad1eEdDf1b1019494E6F78377d264BB2518db6F";

module.exports = {
    ...masterChefExports(masterchef, "polygon", ice, false)
}