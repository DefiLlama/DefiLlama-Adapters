const {masterChefExports} = require("../helper/masterchef");

const token = "0xFdf36F38F5aD1346B7f5E4098797cf8CAE8176D0";
const masterchef = "0x49a21E7Ae826CD5F0c0Cb1dC942d1deD66d21191";

module.exports = {
    ...masterChefExports(masterchef, "bsc", token, false)
} // node test.js projects/waterfallbsc/index.js