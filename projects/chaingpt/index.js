const { stakings } = require("../helper/staking");
const { getLogs } = require('../helper/cache/getLogs')
const { PromisePool } = require('@supercharge/promise-pool');
const { blake2b } = require("blakejs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const cgpt = "0x9840652DC04fb9db2C43853633f0F62BE6f00f98";
const stakingpool1 = "0x765a6ee976137801F2661c3644E1fde369A8ED18";
const stakingpool2 = "0x62A402DEf6Ca37E9CA7a544bE34954748088CCEE";
const stakingpool3 = "0x6eE8D743Eb8bEc665AaCdb535f2F100f040Ca6C5";

const config = {
  ethereum: [
    { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 17003869 },
    { factory: '0xa433b2748d718108323316f460F449453C36420E', fromBlock: 19003869 },
  ],
  polygon: [
    { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 45136100 },
    { factory: '0x9A6f649e421398eeab450b164D9b81Cc4A55A0eA', fromBlock: 57562100 },
  ],
  bsc: [
    { factory: '0xc263365D628568C23d61BDDa24C8EB27CEF4E917', fromBlock: 30004999 },
    { factory: '0x5fC22396a063cabb5E09BA6ba449C9646155Ed3f', fromBlock: 39171504 },
  ],
  arbitrum: [
    { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 111699000 },
    { factory: '0xFB5cd8426FBC3b1f2ea4B113A5A37752B3098C79', fromBlock: 216556000 },
  ],
  avax: [
    { factory: '0xF276Bf68Dde58904439f11f6eD1511e89A7f5a4A', fromBlock: 32665049 },
    { factory: '0x2D47310bB0C6A9D4ae2a1d6625eC0BEe4F473Bb6', fromBlock: 46082883 },
  ],
  core: [
    { factory: '0x9840652DC04fb9db2C43853633f0F62BE6f00f98', fromBlock: 15191500, blacklistedTokens: ['0xcE87100A1dBAf576ebd063EB0890840346338689'] },
  ],
  base: [
    { factory: '0xFB5cd8426FBC3b1f2ea4B113A5A37752B3098C79', fromBlock: 15137100, },
  ],
  xlayer: [
    { factory: '0x9840652DC04fb9db2C43853633f0F62BE6f00f98', fromBlock: 2353300 },
  ],
  linea: [
    { factory: '0xFB5cd8426FBC3b1f2ea4B113A5A37752B3098C79', fromBlock: 5006600 },
  ],
  era: [
    { factory: '0xf25F7c9522cdCD839697F1644CFCA1312306885C', fromBlock: 37458600 },
  ]
}

async function tvl(api) {
  const chainConfigs = config[api.chain]
  const ownerTokens = []
  const poolTokenMapping = {}
  let blacklistedTokens = []

  for (const chainConfig of chainConfigs) {
    const { factory, fromBlock, blacklistedTokens: configBlacklistedTokens } = chainConfig

    if (configBlacklistedTokens) {
      blacklistedTokens = blacklistedTokens.concat(configBlacklistedTokens)
    }

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
  }

  return sumTokens2({ api, ownerTokens, blacklistedTokens, permitFailure: true, })

}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})

module.exports.bsc.staking = stakings([stakingpool1, stakingpool2, stakingpool3,], cgpt)