const sdk = require("@defillama/sdk");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { pool2s } = require('../helper/pool2')
const poolInfo = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accfSapphirePerShare","type":"uint256"},{"internalType":"uint16","name":"depositFeeBP","type":"uint16"},{"internalType":"uint256","name":"lpSupply","type":"uint256"}],"stateMutability":"view","type":"function"}
const warPoolInfo = {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"contract IERC20","name":"lpToken","type":"address"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"accfSapphirePerShare","type":"uint256"},{"internalType":"uint16","name":"depositFeeBP","type":"uint16"},{"internalType":"uint256","name":"lpSupply","type":"uint256"}],"stateMutability":"view","type":"function"}

const chef = "0x5A3b5A572789B87755Fa7720A4Fae36e2e2D3b35"
const sapphireWarChef = "0xD1b96929AceDFa7a2920b5409D0c5636b89dcD85"
const sapphire = "0xfa7d8c3CccC90c07c53feE45A7a333CEC40B441B"
const sapphireWar = "0xB063862a72d234730654c0577C188452424CF53c"
const sapphireFtmLP = "0xC0BFf8416E83E410c38B859Ac92a3268DaDc5494"
const sapphireWarFtmLP = "0x16d6A8A53195208f5038421091d5a9dEf9647250"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transformAddress = await transformFantomAddress()
  await addFundsInMasterChef(balances, chef, chainBlocks.fantom, "fantom", transformAddress, poolInfo, [sapphire, sapphireFtmLP])
  await addFundsInMasterChef(balances, sapphireWarChef, chainBlocks.fantom, "fantom", transformAddress, warPoolInfo, [sapphireWar, sapphireWarFtmLP])
  return balances;
}

async function staking(timestamp, block, chainBlocks) {
  const balances = {}
  const { output: balance } = await sdk.api.abi.multiCall({
    calls: [
      {
        target: sapphire,
        params: chef
      },
      {
        target: sapphireWar,
        params: sapphireWarChef
      }
    ],
    abi: 'erc20:balanceOf',
    block: chainBlocks.fantom,
    chain : "fantom",
    
  })
  await sdk.util.sumSingleBalance(balances, `fantom:${sapphire}`, balance[0].output)
  await sdk.util.sumSingleBalance(balances, `fantom:${sapphireWar}`, balance[1].output)
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
    tvl,
    pool2: pool2s([chef, sapphireWarChef], [sapphireFtmLP, sapphireWarFtmLP], "fantom"),
    staking,
    masterchef: tvl,
  }
}
