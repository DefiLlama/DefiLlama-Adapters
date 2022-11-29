const {masterChefExports} = require("../helper/masterchef");

const masterchef = "0x3BD6827d09a0aF02fe4B6688E16F6fAB8F14938e";
const token = "0x00438AE909739f750c5df58b222Fe0Bde900C210";

module.exports = {
    ...masterChefExports(masterchef, "bsc", token, false)
}