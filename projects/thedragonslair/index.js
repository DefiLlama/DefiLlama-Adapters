const abi = require("./abi.json");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");

const STAKING_CONTRACT = "0xC0F19836931F5Ab43f279D4DD5Ab3089846Db264";
const dregg = "0x88c090496125b751B4E3ce4d3FDB8E47DD079c57"
const pool2s = ["0xB52a2b91Bf89BcB9435ad94D23555EaD26954CA9", "0x6c4339A47AA98CB5759d4B5C4058a30620eE46A5"]

async function tvl(timestamp, ethBlock, chainBlocks){
  const balances = {};

  const transformAddress = await transformAvaxAddress();
  await addFundsInMasterChef(balances, STAKING_CONTRACT, chainBlocks.avax, "avax", transformAddress, abi.poolInfo, [...pool2s, dregg])

  return balances;
};

module.exports = {
  staking:{
    tvl: staking(STAKING_CONTRACT, dregg, "avax")
  },
  pool2:pool2Exports(STAKING_CONTRACT, pool2s, "avax"),
  tvl
};
