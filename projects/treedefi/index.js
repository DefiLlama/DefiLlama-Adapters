const abi = require("./abi.json");
const { transformBscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

const MASTERCHEF_CONTRACT = "0xA9a438B8b2E41B3bf322DBA139aF9490DC226953";

async function bscTvl(timestamp, block, chainBlocks) {
  let balances = {};
  const transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    MASTERCHEF_CONTRACT,
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolInfo,
  );
  return balances;
}
module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: bscTvl,
};