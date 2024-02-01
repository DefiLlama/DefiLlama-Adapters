const {masterChefExports} = require("../helper/masterchef")

const token = "0x9e236b43D779B385c3279820e322ABAE249D3405";
const masterchef = "0x1767B9aF34be444e3C727840d8D19dB0256dBCFA";

module.exports = {
    ...masterChefExports(masterchef, "bsc", token, false)
}