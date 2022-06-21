const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x844cC08183589D0D669fdCC223476a0FE9712F55";
const token = "0xe29E3D9Fa721dFA10ba879fbf0E947425dA611cB";

module.exports = {
    ...masterChefExports(masterchef, "polygon", token, false)
}