const {masterChefExports} = require("../helper/masterchef");

const token = "0x92926DAcCE437955aa47F0DFC7F5C8FCd728b36E";
const masterchef = "0x5F680E57778651f7Cb14678655822ABc469acacf";

module.exports = {
    ...masterChefExports(masterchef, "cronos", token, false),
}