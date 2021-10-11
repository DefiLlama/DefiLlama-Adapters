const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");
const { pool2 } = require('../helper/pool2')
const poolInfo = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accfSapphirePerShare","type":"uint256"},{"internalType":"uint16","name":"depositFeeBP","type":"uint16"},{"internalType":"uint256","name":"lpSupply","type":"uint256"}],"stateMutability":"view","type":"function"}

const chef = "0x5A3b5A572789B87755Fa7720A4Fae36e2e2D3b35"
const sapphire = "0xfa7d8c3CccC90c07c53feE45A7a333CEC40B441B"
const sapphireFtmLP = "0xC0BFf8416E83E410c38B859Ac92a3268DaDc5494"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress();
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, poolInfo, [sapphire, sapphireFtmLP])
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
    tvl,
    pool2: pool2(chef, sapphireFtmLP, "fantom"),
    staking: staking(chef, sapphire, "fantom"),
    masterchef: tvl,
  }
}
