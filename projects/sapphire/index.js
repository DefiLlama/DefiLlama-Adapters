const sdk = require("@defillama/sdk");
const { transformFantomAddress } = require("../helper/portedTokens");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { stakings } = require('../helper/staking')
const poolInfo = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accfSapphirePerShare, uint16 depositFeeBP, uint256 lpSupply)'

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
  await addFundsInMasterChef(balances, sapphireWarChef, chainBlocks.fantom, "fantom", transformAddress, poolInfo, [sapphireWar, sapphireWarFtmLP])
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
  sdk.util.sumSingleBalance(balances, `fantom:${sapphire}`, balance[0].output)
  sdk.util.sumSingleBalance(balances, `fantom:${sapphireWar}`, balance[1].output)
  return balances;
}

module.exports = {
  methodology: "TVL includes all farms in MasterChef contract",
  fantom: {
    tvl,
    pool2: stakings([chef, sapphireWarChef], [sapphireFtmLP, sapphireWarFtmLP], "fantom"),
    staking,
    // masterchef: tvl,
  }
}
