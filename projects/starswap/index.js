const { staking } = require('../helper/staking')
const { getUniTVL, } = require('../helper/unknownTokens')

const FACTORIES = "0x0b657e81a0C3E903cbe1228579fBd49AC5D81Ac1"

const TOKENS = {
  STAR: "0x8489f4554790F5A103F2B0398537eAEe68B73884"
}

const STAKING_CONTRACT = "0x0262592d5f489e19afe070abc88a0808afc75250"

module.exports = {
  misrepresentedTokens: true,
  methodology: "StarSwap TVL Calculation",
  astar: {
    tvl: getUniTVL({
      factory: FACTORIES,
      useDefaultCoreAssets: true,
    }),
    staking: staking(STAKING_CONTRACT, TOKENS.STAR)
  }
}
