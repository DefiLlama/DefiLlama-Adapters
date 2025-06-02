const {masterChefExports} = require("../helper/masterchef");

const masterchef = "0x67D26cF7e6CB68feE0Cf546Ac489691d961c97da"
const buff = "0x10a49f1fc8c604ea7f1c49bcc6ab2a8e58e77ea5";

module.exports = {
    ...masterChefExports(masterchef, "bsc", buff)
}