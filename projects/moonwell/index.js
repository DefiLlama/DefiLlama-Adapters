const { compoundExports2 } = require('../helper/compound')
const { staking } = require('../helper/staking');

const moonbeamConfig = {
  comptroller: '0x8E00D5e02E65A19337Cdba98bbA9F84d4186a180',
  nativeTokenMarket: '0x091608f4e4a15335145be0A279483C0f8E4c7955',
  stakingContract: '0x8568A675384d761f36eC269D695d6Ce4423cfaB1',
  stakingTokenAddress: '0x511aB53F793683763E5a8829738301368a2411E3'
}


const baseConfig = {
  comptroller: '0xfBb21d0380beE3312B33c4353c8936a0F13EF26C',
  stakingContract: '0xe66E3A37C3274Ac24FE8590f7D84A2427194DC17',
  stakingTokenAddress: '0xA88594D404727625A9437C3f886C7643872296AE',
  vaults: [
    {
      address: "0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1",
      decimals: 1e18,
      name: "Moonwell Flagship ETH",
      symbol: "mwETH",
      coingeckoId: "ethereum"
    },
    {
      address: "0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca",
      decimals: 1e6,
      name: "Moonwell Flagship USDC",
      symbol: "mwUSDC",
      coingeckoId: "usd-coin"
    },
    {
      address: "0xf24608E0CCb972b0b0f4A6446a0BBf58c701a026",
      decimals: 1e6,
      name: "Moonwell Flagship EURC",
      symbol: "mwEURC",
      coingeckoId: "euro-coin"
    },
  ]
}

const optimismConfig = {
  comptroller: '0xCa889f40aae37FFf165BccF69aeF1E82b5C511B9',
  stakingContract: '0xfB26A4947A38cb53e2D083c6490060CCCE7438c5',
  stakingTokenAddress: '0xA88594D404727625A9437C3f886C7643872296AE'
}

const moonbeamStaking = staking(moonbeamConfig.stakingContract, moonbeamConfig.stakingTokenAddress,)
const baseStaking = staking(baseConfig.stakingContract, baseConfig.stakingTokenAddress,)
const optimismStaking = staking(optimismConfig.stakingContract, optimismConfig.stakingTokenAddress,)

async function getVaultTVL(api, vaults) {
  const bals = await api.multiCall({
    abi: "uint256:totalAssets",
    calls: vaults.map(vault => vault.address),
  });
  for (const vault of vaults) {
    api.addCGToken(vault.coingeckoId, bals[vaults.map(e => e.address).indexOf(vault.address)] / vault.decimals);
  }
}

module.exports = {
  moonbeam: compoundExports2({ comptroller: moonbeamConfig.comptroller, cether: '0x091608f4e4a15335145be0a279483c0f8e4c7955' }),
  base: {
    tvl: (api) => new Promise((resolve, reject) => {
      compoundExports2({ comptroller: baseConfig.comptroller }).tvl(api).then(() => {
        getVaultTVL(api, baseConfig.vaults).then(() => {
          resolve();
        })
      })
    }),
    borrowed: compoundExports2({ comptroller: baseConfig.comptroller }).borrowed,
  },
  optimism: compoundExports2({ comptroller: optimismConfig.comptroller, }),
  hallmarks: [[1659312000, 'Nomad Bridge Exploit']]
}

module.exports.moonbeam.staking = moonbeamStaking
module.exports.base.staking = baseStaking
module.exports.optimism.staking = optimismStaking