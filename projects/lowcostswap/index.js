const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x57f70857aB735576ab5216Cd5e58c6dAe72F21D7";
const token = "0xDBfe47255CbA4A7623985444E730719E9F958E67";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}