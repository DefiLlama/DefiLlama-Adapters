const { masterChefExports } = require("../helper/masterchef");

const masterchef = "0x35bed8D2Ad5cf2cDF520a5f1c91757522CF1bb5b";
const token = "0xe2a8bcbe59177d5ed16Ea39d45Ffd69a4eddC27C";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(masterchef, "bsc", token, false)
}