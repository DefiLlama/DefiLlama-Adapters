const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens } = require("./helper/unwrapLPs");
const { compoundExports } = require("./helper/compound");
const { stakingAssetsETH, stakingAssetsBSC, stakingAssetsPOLYGON, } = require("./config/mantra-dao/contracts/naked-staking-contracts");
const { lpStakingAssetsETH, lpStakingAssetsBSC, lpStakingAssetsPOLYGON, } = require("./config/mantra-dao/contracts/lp-staking-contracts");

const chainConfig = {
  ethereum: { staking: stakingAssetsETH, pool2: lpStakingAssetsETH, },
  bsc: { staking: stakingAssetsBSC, pool2: lpStakingAssetsBSC, },
  polygon: { staking: stakingAssetsPOLYGON, pool2: lpStakingAssetsPOLYGON, },
}

const comptroller = "0x606246e9EF6C70DCb6CEE42136cd06D127E2B7C7"
const zenETH = "0x4F905f75F5576228eD2D0EA508Fb0c32a0696090"
const zenETHEquivalent = ADDRESSES.ethereum.WETH;

module.exports = {}

Object.keys(chainConfig).forEach(chain => {
  const { staking, pool2 } = chainConfig[chain]
  let ethAdditional = {}

  if (chain === 'ethereum')
    ethAdditional = compoundExports(comptroller, "ethereum", zenETH, zenETHEquivalent)

  module.exports[chain] = {
    tvl: () => ({}),
    staking: async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      const tokens = staking.map(i => [i.token, i.contract,])
      return sumTokens(undefined, tokens, block, chain)
    },
    pool2: async (ts, _block, chainBlocks) => {
      const block = chainBlocks[chain]
      const tokens = pool2.map((p) => [p.pairAddress, p.contract,])
      return sumTokens(undefined, tokens, block, chain)
    },
    ...ethAdditional,
  }
})

