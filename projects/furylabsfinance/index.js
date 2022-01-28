const {masterChefExports} = require("../helper/masterchef");

const furyToken = "0xB1822A7ee73DD7de6Eda328A0681f8E1779CC4B6";
const masterchef = "0x23e2DA1657C2b552185d7AF485d6f4825f68200a";

module.exports = {
    ...masterChefExports(masterchef, "fantom", furyToken, false)
} // node test.js projects/furylabsfinance/index.js