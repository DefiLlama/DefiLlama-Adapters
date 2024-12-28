const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0xD35a150Ec317a8a187C52FC1164b4D15C0851b84";
const token = "0x12C415aAFB1A521B42251e972BB7Ce6795F7669b";

module.exports = masterChefExports(masterchef, "bsc", token)