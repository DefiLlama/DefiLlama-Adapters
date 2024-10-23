const { getLogs } = require("../helper/cache/getLogs")
const { sumTokens2 } = require("../helper/unwrapLPs")
const { staking } = require("../helper/staking");

const A51_STAKING_CONTRACT = "0x10a62e0d8491751c40476d432f9e19ba8f699a61";
const A51 = "0xe9e7c09e82328c3107d367f6c617cf9977e63ed0";


const getStrategiesDetails = "function strategies(bytes32) view returns ( tuple(address pool, int24 tickLower, int24 tickUpper) key, address owner, bytes actions, bytes actionStatus, bool isCompound, bool isPrivate, uint256 managementFee, uint256 performanceFee, tuple(uint256 fee0, uint256 fee1, uint256 balance0, uint256 balance1, uint256 totalShares, uint128 uniswapLiquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128) account)"
const getStrategyReserves = "function getStrategyReserves(address, int24, int24, uint128) returns (uint256 reserves0, uint256 reserves1)"

const DEFAULT_STRATEGY_CREATION_TOPIC = "StrategyCreated(bytes32)"

const config = {
  // uniswap
  arbitrum: [{ target: "0x3e0aa2e17fe3e5e319f388c794fdbc3c64ef9da6", helper: "0x9d80597d9403bdb35b3d7d9f400377e790b01053", startBlock: 190945156 },],
  // uniswap
  blast: [{ target: "0x5a8e82c4b3Dbd7579fD198A3276cF75CEA2Df63D", helper: "0xbA13be69628d12963b28de8E7Ba04C3C4c1eaceA", startBlock: 1709947 },],
  base: [
    // uniswap
    { target: "0x3e0AA2e17FE3E5e319f388C794FdBC3c64Ef9da6", helper: "0xA1d8180F4482359CEb7Eb7437FCf4a2616830F81", startBlock: 12765695 },
    // BaseSwap
    { target: "0xDFb179526ae303Eea49AC99DD360159C39105828", helper: "0x6e7e838E20ED6657Aaf1166f9B7a845565956F51", startBlock: 13890566 },
  ],
  // uniswap
  optimism: [{ target: "0x525c80e91efe9222de3eae86af69a480fbced416", helper: "0x965356eb2c208ce4130e267342ca720042cce7b2", startBlock: 118360616 },],
  polygon: [
    // uniswap
    { target: "0xD4798F142FDb87738eF4eBE82Bd56Eccde19A88C", helper: "0x9c225a02426e3229C073A6132E083561e95000b5", startBlock: 55506149 },
    // quickswap
    { target: "0xED19D4A923930F6B0348fE06be694FeC56a70b86", helper: "0x6c8b11476475FA487e2bfa6fE00244160F80213e", startBlock: 56237007,  },
  ],
  // quickswap
  polygon_zkevm: [{target: "0xBd7887e11A9356957680A34955a135cf465e7052",helper: "0x965356eb2C208Ce4130E267342cA720042Cce7b2",startBlock: 11928029,},],
  // uniswap
  bsc: [{ target: "0x6F2b186e9392042B1edE2D1D1706a3DC4a4725d8", helper: "0x9c225a02426e3229C073A6132E083561e95000b5", startBlock: 37623104 },],
  // uniswap
  scroll: [{ target: "0xA8Dc31c8C9F93dB2e42A5472F580689794639576", helper: "0x965356eb2C208Ce4130E267342cA720042Cce7b2", startBlock: 4846051 },],
  // quickswap
  manta: [{ target: "0x69317029384c3305fC04670c68a2b434e2D8C44C", helper: "0xa1d8180f4482359ceb7eb7437fcf4a2616830f81", startBlock: 1834975 },],
  // lynex 
  linea: [{target: "0xA8Dc31c8C9F93dB2e42A5472F580689794639576",helper: "0x965356eb2C208Ce4130E267342cA720042Cce7b2",startBlock: 4518443,},],
  // swapmode
  mode: [{ target: "0x69317029384c3305fC04670c68a2b434e2D8C44C", helper: "0xFFD9acf25F2D930BE88D486D588ecBa7a418DE0B", startBlock: 11042629 },],
}

module.exports = {
  doublecounted: true,
}

Object.keys(config).forEach(chain => {
  const configs = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      await Promise.all(configs.map(addConfigTvl))

      async function addConfigTvl({ target, helper, startBlock, topic = DEFAULT_STRATEGY_CREATION_TOPIC }) {
        const strategyLogs = await getLogs({ target, topic, fromBlock: startBlock, api, })
        const strategies = strategyLogs.map(log => log.topics[1])

        const pools = []
        const reservesCalls = []

        const strategyDetails = await api.multiCall({ abi: getStrategiesDetails, target, calls: strategies, })

        strategyDetails.forEach(({ key: { pool, tickLower, tickUpper }, account }) => {
          pools.push(pool)

          reservesCalls.push({ params: [pool, Number(tickLower), Number(tickUpper), account.uniswapLiquidity,], })
        })

        const [token0s, token1s, reserves] = await Promise.all([
          api.multiCall({ abi: 'address:token0', calls: pools, }),
          api.multiCall({ abi: 'address:token1', calls: pools, }),
          api.multiCall({ abi: getStrategyReserves, calls: reservesCalls, target: helper, }),
        ])

        reserves.forEach((reserve, index) => {
          api.add(token0s[index], reserve.reserves0)
          api.add(token1s[index], reserve.reserves1)
        })

        return sumTokens2({ owner: target, tokens: token0s.concat(token1s), api, })
      }
    }
  }
})

module.exports.polygon.staking = staking(A51_STAKING_CONTRACT, A51)