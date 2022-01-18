const abi = require("../helper/abis/masterchef.json")
const { transformbscAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2Exports } = require('../helper/pool2')


const chef = "0x49a21E7Ae826CD5F0c0Cb1dC942d1deD66d21191"
const waterfall = "0xFdf36F38F5aD1346B7f5E4098797cf8CAE8176D0"
const waterfallBnbLP = "0xdee08b5694e4ec7e9442b524479ec58c140fb4fe"
const waterfallBusdLP = "0xb39463988d37bb4cb77a0ca6e80d612686796dc1";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformbscAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.bsc, "bsc", transformAddress, abi.poolInfo, [waterfall, waterfallBnbLP, waterfallBusdLP]);
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  bsc: {
      tvl,
      staking: staking(chef, waterfall, "bsc"),
      pool2: pool2Exports(chef, [waterfallBnbLP, waterfallBusdLP], "bsc"),
  },
  
} 