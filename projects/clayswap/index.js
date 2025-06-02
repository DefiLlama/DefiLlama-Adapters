const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x4c7fc1495559a13d68fa4b60286621dfcec16cf3";
const token = "0xfd54aE2369a3Be69d441cAcC49F920fFEc9068Ac";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}