const { getLogs, getLogs2 } = require('../helper/cache/getLogs')

const abi = {
  "getTotalAmounts": "function getTotalAmounts() view returns (uint256 total0, uint256 total1)",
  "getPoolTVL": "function getPoolTVL(address manager, (address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks) key) view returns ((uint256 coreAmount0, uint256 coreAmount1, uint256 hookReserves0, uint256 hookReserves1, uint256 hookEffective0, uint256 hookEffective1, uint160 sqrtPriceX96, int24 tick, uint128 activeLiquidity, uint256 blockNumber, address statsProvider, uint16 hookPermissions, bool hasCustomAccounting, uint8 statsStatus) result)",
}

module.exports = {
  methodology: "Vault deposits and fee-excluded core liquidity in Aegis-hooked Uniswap v4 and Calamari v4 pools on Ink. Pools are discovered from on-chain PoolManager and Aegis Engine initialization events, with reserves read on-chain. Uniswap v4 pool liquidity also appears in Uniswap v4 TVL.",
  misrepresentedTokens: true,
  doublecounted: true,
} // node test.js projects/thedeep/index.js

const reservesLens = '0x0000001b173C3bbF3984D417d8614E3eed34865B'
const poolInitializedAbi = 'event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)'
const marketInitializedAbi = 'event MarketInitialized(bytes32 indexed poolId, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks)'
const inkAegisDeployments = [
  { aegisEngine: '0x1a22457422B9308AB0C0dC6cef8629e061716009', poolManager: '0x360e68faccca8ca495c1b759fd9eee466db9fb32', hook: '0xe449e013004db4a5681e9622ca10c5ba0ea610cc', fromBlock: 55988139 },
  { aegisEngine: '0x2fC2f4D1EEf9C5F63cdfC13BE3b842cBda8eF946', poolManager: '0x6E4723A612831AfB9f5B2a5aE22723c37aAB9560', hook: '0x2f449fa3f078960313749bc45ffcde0987f790cc', fromBlock: 59523618 },
]

async function addInkAegisPools(api) {
  const block = await api.getBlock()
  for (const { aegisEngine, poolManager, hook, fromBlock } of inkAegisDeployments) {
    if (block < fromBlock) continue
    const [poolLogs, marketLogs] = await Promise.all([
      getLogs2({ api, factory: poolManager, eventAbi: poolInitializedAbi, fromBlock }),
      getLogs2({ api, factory: aegisEngine, eventAbi: marketInitializedAbi, fromBlock }),
    ])
    const pools = new Map()
    for (const log of poolLogs) {
      if (log.hooks.toLowerCase() === hook) pools.set(log.id.toLowerCase(), log)
    }
    for (const log of marketLogs) {
      if (log.hooks.toLowerCase() === hook) pools.set(log.poolId.toLowerCase(), log)
    }
    for (const pool of pools.values()) {
      const reserves = await api.call({
        target: reservesLens,
        abi: abi.getPoolTVL,
        params: [poolManager, [pool.currency0, pool.currency1, pool.fee, pool.tickSpacing, pool.hooks]],
      })
      api.add(pool.currency0, reserves.coreAmount0)
      api.add(pool.currency1, reserves.coreAmount1)
    }
  }
}

const eventAbi = 'event ICHIVaultCreated (address indexed sender, address ichiVault, address tokenA, bool allowTokenA, address tokenB, bool allowTokenB, uint24 fee, uint256 count)'
const topic = '0xde147f43b6837f282eee187234c866cf001806167325f3ea883e36bed0c16a20'

const config = {
  base: {
    vaultConfigs: [
      { factory: '0xBff23e60F41A11cf131B7180Cbd2BD3d47d17ad1', fromBlock: 32389228, }, // Aerodrome Legacy
      { factory: '0xf6B5Ab192F2696921F60a1Ff00b99596C4045FA6', fromBlock: 34267944, }, // Aerodrome
      { factory: '0xaBe5B5AC472Ead17B4B4CaC7fAF42430748ab3b3', fromBlock: 12978552, }, // Uniswap 
    ]
  },
  bsc: {
    vaultConfigs: [
      { factory: '0x131c03ca881B7cC66d7a5120A9273ebf675C241D', fromBlock: 30131926, }, // Pancakeswap
    ]
  },
  btnx: {
    vaultConfigs: [
      { factory: '0x53511764DE94CdA43CbBadFFCca3F29D2EFAB0F8', fromBlock: 1785696, }, // Bitzy
    ]
  },
  celo: {
    vaultConfigs: [
      { factory: '0x8D05f6870106707BaeCFCf5C0570DB7a583eb92A', fromBlock: 27821113, }, // Ubeswap
      { factory: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F', fromBlock: 24256269, }, // Uniswap
      { factory: '0xB3bf88Cb919a222A6F9c90ca8a9ac261CBD3e5bF', fromBlock: 38293141, }, // Velodrome Legacy
      { factory: '0x82DcA62C4B5Dd28Cc85CE8Ae3B170Ce020e33870', fromBlock: 38293141, }, // Velodrome
    ],
  },
  flow: {
    vaultConfigs: [
      { factory: '0x6992bB9dDbf44166e3739c8A3147e7e70a082cEb', fromBlock: 43561997, }, // FlowSwap
      { factory: '0x3bE78614342C7763d87520b2502085761Aa4e5f8', fromBlock: 39081014, }, // KittyPunch
    ],
  },
  ink: {
    vaultConfigs: [
      { factory: '0x65CD1f0ac298519BE4891B5812053e00BD2074AC', fromBlock: 1303936, }, // Reservoir (v1.1)
      { factory: '0x64dA1Ab5b42c71E8FaF1664745af911B859A06D4', fromBlock: 16767552, }, // Velodrome (fee) Legacy
      { factory: '0x822b0bE4958ab5b4A48DA3c5f68Fc54846093618', fromBlock: 21830207, }, // Velodrome (fee)
    ],
  },
  katana: {
    vaultConfigs: [
      { factory: '0x9176B8Eb7Fdff309BE258F2F2eDB32a8b79f19B5', fromBlock: 4739302, }, // Sushi
    ]
  },
  hemi: {
    vaultConfigs:[
      { factory: '0x5541Bcd3d163326CF12267D1cF6207dbde788348', fromBlock: 2624151, }, // Sushi
    ]
  },
  polygon: {
    vaultConfigs: [
      { factory: '0xF39A4c7C87310116Ad915833769d301c599b0298', fromBlock: 79497352, }, // Uniswap
    ]
  },
}

Object.keys(config).forEach(chain => {
  const { vaultConfigs = [], oneFactory } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const blacklistedTokens = []

      for (const {
        factory,
        fromBlock,
      } of vaultConfigs) {
        const logs = await getLogs({
          api,
          target: factory,
          topics: [topic],
          eventAbi: eventAbi,
          onlyArgs: true,
          fromBlock,
        })
        const vaultBalances = await api.multiCall({ abi: abi.getTotalAmounts, calls: logs.map(l => l.ichiVault), permitFailure: true })
        vaultBalances.forEach((b, i) => {
          if (!b) return
          const { tokenA, tokenB } = logs[i]
          if (!blacklistedTokens.includes(tokenA.toLowerCase())) api.add(tokenA, b.total0)
          if (!blacklistedTokens.includes(tokenB.toLowerCase())) api.add(tokenB, b.total1)
        })
      }

      if (chain === 'ink') await addInkAegisPools(api)

      return api.getBalances()
    }
  }
})
