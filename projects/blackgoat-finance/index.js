const {masterChefExports} = require("../helper/masterchef");

const token = "0xa9351B9Bf071a95bEFDAa1e76267919A7214b922";
const masterChef = "0x46ba4eF20f78e881A8219E5368107181617afB50";

module.exports = {
    ...masterChefExports(masterChef, "fantom", token, false)
}