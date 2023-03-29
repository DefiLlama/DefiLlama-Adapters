const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x0283527f549Aef5e6fb91cC30eB1FC8c88545494";
const token = "0x8853759fEC86302F4291F001835E2383538F837A";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}