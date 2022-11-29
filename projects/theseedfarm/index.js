const {masterChefExports} = require("../helper/masterchef")

const masterchef = "0x7E0F299F9bb375c44Ddf1b4E520a8eaAE7564D96";
const token = "0x37427C72f3534d854EE462d18f42aD5fbE74AA2B";

module.exports = {
    ...masterChefExports(masterchef, "avax", token)
}