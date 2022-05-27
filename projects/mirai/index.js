const {masterChefExports} = require("../helper/masterchef") 

const mirai = "0xC6db58E05F647e6D0EE1bf38aC2619867cb9D3cD";
const masterchef = "0x6C6e46c671C848F87A173E95b9511FDA0C84Ba15";

module.exports = {
    ...masterChefExports(masterchef, "polygon", mirai, false)
}