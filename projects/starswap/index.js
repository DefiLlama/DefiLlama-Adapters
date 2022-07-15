const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require("../helper/staking")

const FACTORIES = "0x0b657e81a0C3E903cbe1228579fBd49AC5D81Ac1"

const NATIVE_TOKEN_WASTAR = "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720"

const TOKENS = {
  STAR: "0x8489f4554790F5A103F2B0398537eAEe68B73884"
}

const STAKING_CONTRACTS = {
  astar: "0x0262592d5f489e19afe070abc88a0808afc75250"
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "StarSwap TVL Calculation",
  astar: {
    tvl: getUniTVL({
      factory: FACTORIES,
      chain: 'astar',
      coreAssets:
        [
          NATIVE_TOKEN_WASTAR,
          "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
          "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
          "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb",
          "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA",
          "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
          "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4"
        ],
    }),
    staking: stakingPricedLP(
      STAKING_CONTRACTS.astar,
      TOKENS.STAR,
      "astar",
      "0x4a0e3b2a0c35737d1c2a78fb76470ce31836024c",
      "astar",
      true,
    ),
  }
}
