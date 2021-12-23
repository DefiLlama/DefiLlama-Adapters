const abi = require("./abi.json");
const {addFundsInMasterChef, masterChefExports} = require("../helper/masterchef")

const token = "0x0Aa4ef05B43700BF4b6E6Dc83eA4e9C2CF6Af0fA";
const masterchef = "0x70FCbFB6DA6a6028061FA6E883717990F506B626"

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  await addFundsInMasterChef(balances, masterchef, chainBlocks.avax, "avax", addr=>`avax:${addr}`, abi.poolInfo, [token], true, true, token);
  return balances;
}

module.exports = {
  ...masterChefExports(masterchef, "avax", token, true, abi.poolInfo)
}