const { aaveChainTvl } = require("../helper/aave")
const { stakingPricedLP } = require("../helper/staking")

const POLTER_CONTRACT = '0x5c725631FD299703D0A74C23F89a55c6B9A0C52F'
const MULTIFEE_CONTRACT = '0xb0F8fe472422Ae582a535b5418C82Ff0F9fa9267'
const ADDRESSES_REGISTRY_CONTRACT = '0x44BD4F79A95cF04505F2dc5C8e2e4043f67C7B07'
const POLTER_LP_CONTRACT = '0x44C85D45EB17C8A6b241807BE5c9c48201F91837'

function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = i => `fantom:${i}`
    return aaveChainTvl(
      "fantom",
      ADDRESSES_REGISTRY_CONTRACT,
      transform,
      undefined,
      borrowed
    )(timestamp, ethBlock, chainBlocks)
  };
}

module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  fantom: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: stakingPricedLP(MULTIFEE_CONTRACT, POLTER_CONTRACT, "fantom", POLTER_LP_CONTRACT),
  },
}
