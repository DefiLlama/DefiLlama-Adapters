const {masterChefExports} = require("../helper/masterchef");

const token = "0xb6dd76ce852ff1b23cd8fe21aabb001a5a710a00";
const masterchef = "0x2A807C49e506457D76ce3eBbD716fB2980AF6c79";

module.exports = {
    ...masterChefExports(masterchef, "avax", token, false)
}