const abi = require("./abi.json");
const {masterChefExports} = require('../helper/masterchef');

const MASTERCHEF_CONTRACT = "0x1948abC5400Aa1d72223882958Da3bec643fb4E5";
const token = "0xAa9654BECca45B5BDFA5ac646c939C62b527D394";

module.exports = {
    misrepresentedTokens: true,
    ...masterChefExports(MASTERCHEF_CONTRACT, "polygon", token, true, abi.poolInfo)
}