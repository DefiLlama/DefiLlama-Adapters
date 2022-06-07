const {masterChefExports} = require("../helper/masterchef");

const token = "0xAfAEEe58a58867c73245397C0F768FF041D32d70";
const masterchef = "0x2C875C19E093F446dE65E46473170703486eb0E6";

module.exports = {
    ...masterChefExports(masterchef, "bsc", token)
}