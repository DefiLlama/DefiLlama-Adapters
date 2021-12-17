const abi = require("./abi.json");
const { masterChefExports } = require("../helper/masterchef");

const masterChef = "0x9942cb4c6180820E6211183ab29831641F58577A";
const PNDA = "0x47DcC83a14aD53Ed1f13d3CaE8AA4115f07557C0";

module.exports = masterChefExports(masterChef, "bsc", PNDA, true, abi.poolInfo)