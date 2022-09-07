const {masterChefExports} = require("../helper/masterchef")

const token = "0xdbdc73b95cc0d5e7e99dc95523045fc8d075fb9e";
const masterchef = "0xe5d9c56B271bc7820Eee01BCC99E593e3e7bAD44";

module.exports = {
    ...masterChefExports(masterchef, "bsc", token, false)
} // node test.js projects/animal-farm/index.js