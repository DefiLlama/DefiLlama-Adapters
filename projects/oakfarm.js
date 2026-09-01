const { masterchefExports } = require('./helper/unknownTokens')
const { unwrapLPsAuto } = require('./helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const abi = {
  poolInfo: "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accSushiPerShare)",
  token: "address:token",
  balance: "uint256:balance",
}

const mcExports =
  masterchefExports({
    chain: 'okexchain',
    masterchef: '0xb7C1E1ceAE8b974685872eB8f5196E3440655928',
    nativeToken: '0xc8644956a0c9334a82f26f5773f5dc090d095d2a',
    poolInfoABI: abi.poolInfo,
    useDefaultCoreAssets: true,
  })

const config = {
  okexchain: {
    vaults: [
      '0x85fa637524da5a438df26b85fd55c8ce759168b1',
      '0xfb75a5998dff36862571fb93b9953b78d33401d7',
      '0xa8c3fccd40018bf16e152bef3abc66c245a942c0',
      '0xd51524bb57bac2287135f9651984fb4b3e0aea35',
      '0xd730dab3aff9dd845b3054f4de0a9e935d125b58',
    ],
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}
      const { vaults } = config[chain]
      const tokens = await api.multiCall({  abi: abi.token, calls: vaults }) 
      const bal = await api.multiCall({  abi: abi.balance, calls: vaults }) 
      tokens.forEach((token, i) => sdk.util.sumSingleBalance(balances, `${chain}:${token}`, bal[i]))
      await unwrapLPsAuto({ balances, chain, block: api.block, })
      return balances
    }
  }
  if (chain === 'okexchain')
  module.exports[chain].pool2 = mcExports[chain].pool2
})