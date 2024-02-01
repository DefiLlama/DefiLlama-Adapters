const {masterChefExports} = require("../helper/masterchef");

const token = "0xF1b0F6DF4fc3710b3497c34B0Ee366099054add8";
const masterchef = "0xEF8285A4B4F21D3F9dC9E5cEf7E39977E2Ef8B3d";

module.exports = {
    ...masterChefExports(masterchef, "avax", token, false)
}