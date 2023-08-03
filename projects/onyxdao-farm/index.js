const { masterChefExports, } = require("../helper/masterchef")

const token = "0xB7cD6C8C4600AeD9985d2c0Eb174e0BEe56E8854";
const masterchef = "0xF9C83fF6cf1A9bf2584aa2D00A7297cA8F845CcE";

module.exports = {
    ...masterChefExports(masterchef, "arbitrum", token, false)
}