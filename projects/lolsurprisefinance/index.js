const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0xE1E5B476aa9d85a7df27839f7894406d2528aBBE"
const lol = "0x7AB619B5Bb51eF3ed099A8A81948481Fe5e6099c"

module.exports = {
    ...masterChefExports(masterchef, "bsc", lol)
}