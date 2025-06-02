const {masterChefExports} = require("../helper/masterchef");

const wild = "0x54c6960fbb3e6572377980277057cf08ccad646b";
const masterchef = "0x68B279Cfaf1b0CDE999B5590C3Cb5F74AEc1eF6a";

module.exports = {
    ...masterChefExports(masterchef, "polygon", wild, false)
}