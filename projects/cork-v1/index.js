const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require('../helper/cache/getLogs');

// from https://docs.cork.tech/smart-contracts/v1/live-deployments
const config = {
  ethereum: {
    factory: [
      "0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9",
      "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88",
      "0x55B90B37416DC0Bd936045A8110d1aF3B6Bf0fc3",

    ], fromBlock: 21840338
  },
  // optimism: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 130947675 },
  // base: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 25350988 },
  // arbitrum: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 297842872 },
  // polygon: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 66980384 },
  // blast: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 14377311 },
  // zora: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 25434534 },
  // wc: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 9111872 },
  // ink: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 4580556 },
  // soneium: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 2473300 },
  // avax: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 56195376 },
  // bsc: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 45970610 },
  // unichain: { factory: ["0xCCd90F6435dd78C4ECCED1FA4db0D7242548a2a9", "0x5287E8915445aee78e10190559D8Dd21E0E9Ea88"], fromBlock: 1 },
}

const eventAbi1 = "event InitializedModuleCore(bytes32 indexed id, address indexed pa, address indexed ra, address lv, uint256 expiry, uint256 initialArp, address exchangeRateProvider)"
const eventAbi2 = "event Issued(bytes32 indexed id, uint256 indexed dsId, uint256 indexed expiry, address ds, address ct, bytes32 raCtUniPairId)"
const eventAbi3 = "event Initialized(address indexed ra, address indexed ct, address liquidityToken)"

module.exports = {
  methodology: 'TVL accounts for all assets deposited into the Cork smart contracts.',
  // hallmarks: [
    // [1741100400, "Cork V1 Launch"],
    // ['2025-05-28', "Protocol's wstETH:weETH market was exploited"],
  // ],
}

Object.keys(config).forEach(chain => {
  const { factory: [poolManager, ammHook, router], fromBlock } = config[chain]
  module.exports[chain] = {
    /**
     * Calculates the total value locked (TVL) across the platform's contracts.
     * - Fetches logs from the factory contract to identify relevant tokens.
     * - Extracts unique external token addresses from logs.
     * - Uses sumTokens2 to aggregate TVL data.
     *
     * @param {Object} api - API object providing blockchain access.
     * @returns {Promise<Object>} Total value locked (TVL) balances.
     */
    tvl: async (api) => {
      // Redemption Assets (RA) in Cork AMM pools
      const logs3 = await getLogs2({ api, factory: ammHook, eventAbi: eventAbi3, fromBlock, })
      const tokens = logs3.map(({ ra }) => ra) // RA
      const calls = logs3.map(({ ra, ct }) => ({
        target: ammHook,
        params: [ra, ct],
      }))
      const bals = await api.multiCall({
        abi: 'function getReserves(address token0, address token1) external view returns (uint256 reserve0, uint256 reserve1)',
        calls,
      })
      api.addTokens(tokens, bals.map(({ reserve0 }) => reserve0))

      // Redemption Assets (RA) and Pegged Assets (PA) in Cork PSM pools
      const logs1 = await getLogs2({ api, factory: poolManager, eventAbi: eventAbi1, fromBlock })
      const tokenSet = new Set()
      const ownerTokens = []
      logs1.forEach(log => {
        tokenSet.add(log.pa) // RA
        tokenSet.add(log.ra) // PA
        // if (log.lv !== nullAddress) {
        //   ownerTokens.push([[log.pa, log.ra], log.lv])
        // }
      })
      ownerTokens.push([Array.from(tokenSet), poolManager])
      return sumTokens2({ api, ownerTokens, permitFailure: true, })
    },

    /**
    * Calculates LP tokens (where one side of the market is the platform's own token)
    * locked or staked in the platform's contracts.
    * - Fetches logs for liquidity pools.
    * - Extracts LP tokens from logs.
    * - Uses sumTokens2 to aggregate the Pool2 balances.
    *
    * @param {Object} api - API object providing blockchain access.
    * @returns {Promise<Object>} Pool2 balances.
    */
    // pool2: async (api) => {
    //   // Only LP tokens in Cork Vault pools
    //   const logs3 = await getLogs2({ api, factory: ammHook, eventAbi: eventAbi3, fromBlock, })
    //   const lpTokens = []
    //   logs3.forEach(log => lpTokens.push(log.liquidityToken)) // LPT
    //   const stakingContracts = [poolManager]
    //   return sumTokens2({ api, tokens: lpTokens, owners: stakingContracts, resolveLP: false, })
    // },

    /**
     * Calculates the platform's own tokens locked or staked
     * in the platform's contracts.
     * - Fetches staking-related logs from core and hook contracts.
     * - Extracts the platform's own tokens from logs.
     * - Uses sumTokens2 to aggregate the Staking balances.
     *
     * @param {Object} api - API object providing blockchain access.
     * @returns {Promise<Object>} Staking balances.
     */
    // staking: async (api) => {
    //   // Depeg Swap (DS), Cover Token (CT) and Custom LP tokens in Cork Vault & Router pools
    //   const logs2 = await getLogs2({ api, factory: poolManager, eventAbi: eventAbi2, fromBlock,, })
    //   const logs3 = await getLogs2({ api, factory: ammHook, eventAbi: eventAbi3, fromBlock,  })
    //   const stakingTokens = []
    //   logs2.forEach(log => stakingTokens.push(log.ds, log.ct)) // DS & CT
    //   logs3.forEach(log => stakingTokens.push(log.liquidityToken)) // LPT
    //   const stakingContracts = [poolManager, router]
    //   await sumTokens2({ api, tokens: stakingTokens, owners: stakingContracts, resolveLP: false, })
    // },
  }
})
