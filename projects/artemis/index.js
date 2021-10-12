const abi = require("./abi.json");
const { transformHarmonyAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");

const MASTERCHEF_CONTRACT = "0x59C777cd749b307Be910f15c54A3116ff88f9706";

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  const transformAddress = await transformHarmonyAddress();

  await addFundsInMasterChef(
    balances,
    MASTERCHEF_CONTRACT,
    chainBlocks["harmony"],
    "harmony",
    transformAddress,
    abi.poolInfo,
  );
  if ('harmony' in balances) {
      balances['harmony'] /= 10 ** 18
  }
  return balances;
}
module.exports = {
  harmony: {
    tvl,
  },
  tvl,
};
// node test.js projects/artemis/index.js