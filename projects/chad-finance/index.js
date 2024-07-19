const {masterChefExports} = require("../helper/masterchef");

const chad = "0xcce93540b80abf71b66e0a44fd71e322ce9c4d9e";
const masterchad = "0xDA094Ee6bDaf65c911f72FEBfC58002e5e2656d1";

module.exports = {
    ...masterChefExports(masterchad, "fantom", chad, false)
}

module.exports.deadFrom = '2022-01-26'