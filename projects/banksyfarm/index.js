const {masterChefExports} = require("../helper/masterchef");

const banksy = "0x9C26e24ac6f0EA783fF9CA2bf81543c67cf446d2";
const masterchef = "0x64aB872a2937dE057F21c8e0596C0175FF2084d8"

module.exports = {
    ...masterChefExports(masterchef, "avax", banksy, false)
}