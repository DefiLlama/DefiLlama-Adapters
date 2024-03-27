const { stakings } = require("../helper/staking");
const { getLogs } = require('../helper/cache/getLogs')
const { PromisePool } = require('@supercharge/promise-pool')

const cgpt = "0x9840652DC04fb9db2C43853633f0F62BE6f00f98";
const stakingpool1 = "0x765a6ee976137801F2661c3644E1fde369A8ED18";
const stakingpool2 = "0x62A402DEf6Ca37E9CA7a544bE34954748088CCEE";
const stakingpool3 = "0x6eE8D743Eb8bEc665AaCdb535f2F100f040Ca6C5";

const config = {
  ethereum: { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 17003869 },
  polygon: { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 45136100 },
  bsc: { factory: '0xc263365D628568C23d61BDDa24C8EB27CEF4E917', fromBlock: 30004999 },
  arbitrum: { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 111699000 },
  avax: { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 32665049 }
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]

  const logs2 = await getLogs({
    api,
    target: factory,
    eventAbi: 'event PresalePoolCreated (address registedBy, address indexed token, address indexed pool, uint256 poolId)',
    fromBlock: fromBlock,

  })
  const pools = []
  const poolFromBlocks = {}
  logs2.forEach((i) => {
    pools.push(i.args.pool)
    poolFromBlocks[i.args.pool] = i.blockNumber
  })

  const ownerTokens = []
  const poolTokenMapping = {}
  await PromisePool
    .withConcurrency(7)
    .for(pools)
    .process(async pool => {
      const fromBlock = poolFromBlocks[pool]
      if (!fromBlock) return;
      const logs = await getLogs({
        api,
        target: pool,
        eventAbi: 'event PresalePoolCreated (address token, uint256 openTime, uint256 closeTime, address offeredCurrency, uint256 offeredCurrencyDecimals, uint256 offeredCurrencyRate, address wallet, address owner)',
        fromBlock,
      })
      logs.forEach(({ args: i }) => {
        const key = i.token + '-' + i.owner
        if (!poolTokenMapping[key]) poolTokenMapping[key] = []
        poolTokenMapping[key].push(i.offeredCurrency)
      })
    })

  logs2.forEach(({ args: i }) => {
    const key = i.token + '-' + i.registedBy
    if (!poolTokenMapping[key]) return;

    ownerTokens.push([poolTokenMapping[key], i.pool])
  })
  return api.sumTokens({ ownerTokens })

}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.bsc.staking = stakings([stakingpool1, stakingpool2, stakingpool3,], cgpt)